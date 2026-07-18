import { NodechainService } from '../nodechain/nodechain.service';
import { ArosCoinService } from '../aroscoin/aroscoin.service';
import { parseAro, formatAro } from '../common/money';
import { resolveOkToEmit } from '../invariants';
import { EmissionError, EmissionErrorCode } from './errors';
import type { MintResult, RevaluationResult, BurnResult } from '../token/types';

export type EmissionMode = 'primary_valuation' | 'delta_pro_rata' | 'burn';

export interface EmissionResult {
  mode: EmissionMode;
  processId: string;
  valuation?: string;
  previousValue?: string;
  newValue?: string;
  amount: string;
  holderId?: string;
  potLedgerHeight: number;
  ledgerHeight: number;
  recordId: string;
  mint?: MintResult;
  reval?: RevaluationResult;
  burn?: BurnResult;
}

/**
 * Emission policy: institutional valuation / ΔValue → ArosCoin mint/burn.
 * Never mints without journal ok-to-emit (PoT verified=1 + P1–P4).
 * Caps optional per asset class (config).
 */
export class EmissionService {
  constructor(
    private readonly nodechain: NodechainService,
    private readonly aroscoin: ArosCoinService,
    private readonly opts?: {
      /** Optional absolute mint amount cap per process (ARO decimal string). */
      perProcessCap?: string;
    },
  ) {}

  /**
   * Primary tokenization: emit ARO equal to institutional valuation (fixed institutional price).
   */
  async emitFromValuation(input: {
    processId: string;
    holderId: string;
    valuation: string;
    potLedgerHeight?: number;
  }): Promise<EmissionResult> {
    if (!input.processId?.trim()) {
      throw new EmissionError(EmissionErrorCode.INVALID_PROCESS, 'processId required');
    }
    let valuationArx: bigint;
    try {
      valuationArx = parseAro(input.valuation);
    } catch {
      throw new EmissionError(EmissionErrorCode.INVALID_VALUATION, 'invalid valuation');
    }
    if (valuationArx <= 0n) {
      throw new EmissionError(EmissionErrorCode.INVALID_VALUATION, 'valuation must be positive');
    }
    this.assertCap(formatAro(valuationArx));

    const gate = await this.requireOkToEmit(input.processId);
    const potLedgerHeight = input.potLedgerHeight ?? gate.potLedgerHeight;

    const mint = await this.aroscoin.mintAfterPot({
      processId: input.processId,
      holderId: input.holderId,
      amount: formatAro(valuationArx),
      potVerified: 1,
      potLedgerHeight,
    });

    await this.journalEmission({
      processId: input.processId,
      mode: 'primary_valuation',
      valuation: formatAro(valuationArx),
      amount: mint.amount,
      holderId: input.holderId,
      potLedgerHeight,
      mintRecordId: mint.recordId,
    });

    return {
      mode: 'primary_valuation',
      processId: input.processId,
      valuation: formatAro(valuationArx),
      amount: mint.amount,
      holderId: input.holderId,
      potLedgerHeight,
      ledgerHeight: mint.ledgerHeight,
      recordId: mint.recordId,
      mint,
    };
  }

  /**
   * Revaluation emission: ΔValue → pro-rata supply change via ArosCoin.
   */
  async emitFromDeltaValue(input: {
    processId: string;
    previousValue: string;
    newValue: string;
    potLedgerHeight?: number;
  }): Promise<EmissionResult> {
    if (!input.processId?.trim()) {
      throw new EmissionError(EmissionErrorCode.INVALID_PROCESS, 'processId required');
    }
    let prev: bigint;
    let next: bigint;
    try {
      prev = parseAro(input.previousValue);
      next = parseAro(input.newValue);
    } catch {
      throw new EmissionError(EmissionErrorCode.INVALID_VALUATION, 'invalid valuation');
    }
    if (prev === next) {
      throw new EmissionError(EmissionErrorCode.ZERO_DELTA, 'zero ΔValue — nothing to emit');
    }

    const gate = await this.requireOkToEmit(input.processId);
    const potLedgerHeight = input.potLedgerHeight ?? gate.potLedgerHeight;

    const reval = await this.aroscoin.revalueAfterPot({
      processId: input.processId,
      previousValue: formatAro(prev),
      newValue: formatAro(next),
      potVerified: 1,
      potLedgerHeight,
    });

    await this.journalEmission({
      processId: input.processId,
      mode: 'delta_pro_rata',
      previousValue: formatAro(prev),
      newValue: formatAro(next),
      amount: reval.deltaValue,
      potLedgerHeight,
      revalRecordId: reval.recordId,
    });

    return {
      mode: 'delta_pro_rata',
      processId: input.processId,
      previousValue: formatAro(prev),
      newValue: formatAro(next),
      amount: reval.deltaValue,
      potLedgerHeight,
      ledgerHeight: reval.ledgerHeight,
      recordId: reval.recordId,
      reval,
    };
  }

  /** Process-bound burn through ArosCoin. */
  async burn(input: {
    processId: string;
    holderId: string;
    amount: string;
  }): Promise<EmissionResult> {
    if (!input.processId?.trim()) {
      throw new EmissionError(EmissionErrorCode.INVALID_PROCESS, 'processId required');
    }
    const burn = await this.aroscoin.burn(input);
    await this.journalEmission({
      processId: input.processId,
      mode: 'burn',
      amount: burn.amount,
      holderId: input.holderId,
      potLedgerHeight: -1,
      burnRecordId: burn.recordId,
    });
    return {
      mode: 'burn',
      processId: input.processId,
      amount: burn.amount,
      holderId: input.holderId,
      potLedgerHeight: -1,
      ledgerHeight: burn.ledgerHeight,
      recordId: burn.recordId,
      burn,
    };
  }

  private async requireOkToEmit(processId: string) {
    try {
      return await resolveOkToEmit(this.nodechain, processId);
    } catch (e) {
      throw new EmissionError(
        EmissionErrorCode.POT_REQUIRED,
        e instanceof Error ? e.message : 'emission requires journal ok-to-emit (PoT verified=1)',
      );
    }
  }

  private assertCap(amount: string): void {
    if (!this.opts?.perProcessCap) return;
    if (parseAro(amount) > parseAro(this.opts.perProcessCap)) {
      throw new EmissionError(
        EmissionErrorCode.CAP_EXCEEDED,
        `emission ${amount} exceeds per-process cap ${this.opts.perProcessCap}`,
      );
    }
  }

  private async journalEmission(payload: Record<string, unknown> & { processId: string }): Promise<void> {
    await this.nodechain.append({
      clientRecordId: `emission:${payload.processId}:${payload.mode}:${Date.now()}`,
      recordType: 'emission_fact',
      processId: payload.processId,
      payload: {
        schemaVersion: 'emission-1',
        ...payload,
      },
      writerId: 'emission',
      writerRole: 'emission',
    });
  }
}
