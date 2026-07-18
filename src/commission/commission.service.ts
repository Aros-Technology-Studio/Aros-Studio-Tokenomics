import { NodechainService } from '../nodechain/nodechain.service';
import { mulRate, parseAro, formatAro } from '../common/money';
import { CommissionError, CommissionErrorCode } from './errors';
import {
  FeeScheduleRegistry,
  SHIP_AST_SHARE,
  SHIP_NODES_SHARE,
  splitFee,
  type FeeSchedule,
} from './schedules';
import { distributeByWeight } from './weights';

export interface SettlementResult {
  processId: string;
  scheduleId: string;
  valuation: string;
  feeRate: number;
  fee: string;
  nodesPool: string;
  astShare: string;
  payments: Record<string, string>;
  split: { nodes: number; ast: number };
  waiverApplied: boolean;
  ledgerHeight: number;
  recordId: string;
}

export interface NodePaymentBalance {
  nodeId: string;
  credited: string;
}

/**
 * Layer 06 — post-factum commission / settlement.
 * Ship default 70% nodes / 30% AST. Currency ARO. Requires potVerified=1.
 */
export class CommissionService {
  private readonly schedules: FeeScheduleRegistry;
  private settled = new Set<string>();
  private nodeCredits = new Map<string, bigint>();
  private hydrated = false;

  constructor(
    private readonly nodechain: NodechainService,
    schedules?: FeeScheduleRegistry,
  ) {
    this.schedules = schedules ?? new FeeScheduleRegistry();
  }

  listSchedules(): FeeSchedule[] {
    return this.schedules.list();
  }

  nodeBalance(nodeId: string): string {
    return formatAro(this.nodeCredits.get(nodeId) ?? 0n);
  }

  listNodeBalances(): NodePaymentBalance[] {
    return [...this.nodeCredits.entries()]
      .map(([nodeId, v]) => ({ nodeId, credited: formatAro(v) }))
      .sort((a, b) => a.nodeId.localeCompare(b.nodeId));
  }

  async hydrateFromJournal(): Promise<{ settlements: number; payments: number }> {
    const all = await this.nodechain.listAll();
    this.settled.clear();
    this.nodeCredits.clear();
    let settlements = 0;
    let payments = 0;
    for (const r of all) {
      if (r.recordType === 'commission_settled' && r.processId) {
        this.settled.add(r.processId);
        settlements += 1;
      }
      if (r.recordType === 'payment_credited') {
        const nodeId = String(r.payload.nodeId ?? '');
        const amount = String(r.payload.amount ?? '0');
        if (nodeId) {
          this.nodeCredits.set(
            nodeId,
            (this.nodeCredits.get(nodeId) ?? 0n) + parseAro(amount),
          );
          payments += 1;
        }
      }
    }
    this.hydrated = true;
    return { settlements, payments };
  }

  /**
   * Full settlement: fee from schedule/valuation → split → node payments + AST share.
   * Alias names per P0–P4: settleCommission.
   */
  async settleCommission(input: {
    processId: string;
    valuation: string;
    potVerified: 0 | 1;
    nodeWeights: Record<string, number>;
    scheduleId?: string;
    /** Override fee rate (optional). */
    feeRate?: number;
    /** 0..1 waiver of fee (0 = full fee, 1 = free). */
    feeWaiver?: number;
  }): Promise<SettlementResult> {
    return this.settle(input);
  }

  /** @deprecated use settleCommission — kept for call-site compatibility */
  async settle(input: {
    processId: string;
    valuation: string;
    potVerified: 0 | 1;
    nodeWeights: Record<string, number>;
    scheduleId?: string;
    feeRate?: number;
    feeWaiver?: number;
  }): Promise<SettlementResult> {
    if (!input.processId?.trim()) {
      throw new CommissionError(CommissionErrorCode.INVALID_PROCESS, 'processId required');
    }
    if (input.potVerified !== 1) {
      throw new CommissionError(CommissionErrorCode.POT_REQUIRED, 'settle requires pot verified=1');
    }

    await this.ensureHydrated();
    if (this.settled.has(input.processId) || (await this.journalSettled(input.processId))) {
      throw new CommissionError(
        CommissionErrorCode.ALREADY_SETTLED,
        `process already settled: ${input.processId}`,
      );
    }

    let valuationArx: bigint;
    try {
      valuationArx = parseAro(input.valuation);
    } catch {
      throw new CommissionError(CommissionErrorCode.INVALID_VALUATION, 'invalid valuation');
    }
    if (valuationArx <= 0n) {
      throw new CommissionError(CommissionErrorCode.INVALID_VALUATION, 'valuation must be positive');
    }

    const schedule = this.schedules.get(input.scheduleId ?? 'default');
    const feeRate = input.feeRate ?? schedule.feeRate;
    if (feeRate < 0 || feeRate > 1) {
      throw new CommissionError(CommissionErrorCode.INVALID_SCHEDULE, 'feeRate out of range');
    }

    const waiver = input.feeWaiver ?? 0;
    if (waiver < 0 || waiver > 1) {
      throw new CommissionError(CommissionErrorCode.WAIVER_INVALID, 'feeWaiver must be in [0,1]');
    }

    const weights = input.nodeWeights ?? {};
    const positiveWeights = Object.values(weights).filter((w) => w > 0);
    if (!positiveWeights.length) {
      throw new CommissionError(CommissionErrorCode.INVALID_WEIGHTS, 'nodeWeights required');
    }

    const grossFee = mulRate(input.valuation, feeRate);
    const feeAfterWaiver =
      waiver === 0
        ? grossFee
        : formatAro((parseAro(grossFee) * BigInt(Math.round((1 - waiver) * 10_000))) / 10_000n);

    const feeArx = parseAro(feeAfterWaiver);
    const { nodesPool, astShare } = splitFee(feeArx, schedule.nodesShare);
    const payments = distributeByWeight(nodesPool, weights);

    const r = await this.nodechain.append({
      clientRecordId: `commission:${input.processId}`,
      recordType: 'commission_settled',
      processId: input.processId,
      payload: {
        scheduleId: schedule.id,
        valuation: formatAro(valuationArx),
        feeRate,
        feeWaiver: waiver,
        fee: formatAro(feeArx),
        nodesPool: formatAro(nodesPool),
        astShare: formatAro(astShare),
        split: { nodes: schedule.nodesShare, ast: 1 - schedule.nodesShare },
        payments,
        potVerified: 1,
      },
      writerId: 'settlement',
      writerRole: 'settlement',
    });

    await this.distributeNodePayment({
      processId: input.processId,
      payments,
    });

    this.settled.add(input.processId);

    return {
      processId: input.processId,
      scheduleId: schedule.id,
      valuation: formatAro(valuationArx),
      feeRate,
      fee: formatAro(feeArx),
      nodesPool: formatAro(nodesPool),
      astShare: formatAro(astShare),
      payments,
      split: { nodes: schedule.nodesShare, ast: 1 - schedule.nodesShare },
      waiverApplied: waiver > 0,
      ledgerHeight: r.height,
      recordId: r.recordId,
    };
  }

  /**
   * Credit node payment accounts and journal payment_credited rows.
   * P0–P4 name: distributeNodePayment.
   */
  async distributeNodePayment(input: {
    processId: string;
    payments: Record<string, string>;
  }): Promise<{ credits: NodePaymentBalance[] }> {
    await this.ensureHydrated();
    const credits: NodePaymentBalance[] = [];
    for (const [nodeId, amount] of Object.entries(input.payments)) {
      const arx = parseAro(amount);
      if (arx <= 0n) continue;
      this.nodeCredits.set(nodeId, (this.nodeCredits.get(nodeId) ?? 0n) + arx);
      await this.nodechain.append({
        clientRecordId: `pay:${input.processId}:${nodeId}`,
        recordType: 'payment_credited',
        processId: input.processId,
        payload: {
          nodeId,
          amount: formatAro(arx),
          currency: 'ARO',
          postFactum: true,
        },
        writerId: 'settlement',
        writerRole: 'settlement',
      });
      credits.push({ nodeId, credited: formatAro(arx) });
    }
    return { credits };
  }

  private async ensureHydrated(): Promise<void> {
    if (!this.hydrated) await this.hydrateFromJournal();
  }

  private async journalSettled(processId: string): Promise<boolean> {
    const rows = await this.nodechain.listByProcessId(processId);
    return rows.some((r) => r.recordType === 'commission_settled');
  }
}

export { SHIP_NODES_SHARE, SHIP_AST_SHARE };
