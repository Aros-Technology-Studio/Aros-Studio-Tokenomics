import { Injectable, Optional } from '@nestjs/common';
import Decimal from 'decimal.js';
import { floorToArx, parseDecimal } from '../common/money/money';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { NodechainService } from '../nodechain/nodechain.service';
import { NodeReputationService } from '../node-reputation/node-reputation.service';
import { PotService } from '../pot/pot.service';
import { ReserveService } from '../reserve/reserve.service';

type Dec = InstanceType<typeof Decimal>;

/** Ship default 70% nodes / 30% AST (CANON §XII). */
export const DEFAULT_NODE_SHARE = new Decimal('0.70');
export const DEFAULT_RESERVE_SHARE = new Decimal('0.30');

export interface SettleInput {
  processId: string;
  /** Fee base = institutional valuation. */
  valuation: string;
  feeRate: string;
  nodeWeights: Record<string, string>;
}

/**
 * Post-factum settlement on PoT. API names: settleCommission / distributeNodePayment.
 */
@Injectable()
export class CommissionService {
  private nodePayments = new Map<string, Dec>();

  constructor(
    private readonly pot: PotService,
    private readonly nodechain: NodechainService,
    private readonly reserve: ReserveService,
    @Optional() private readonly reputation?: NodeReputationService,
  ) {}

  /**
   * Prefer explicit weights; if omitted nodeIds provided, derive from reputation.
   */
  resolveNodeWeights(
    explicit: Record<string, string> | undefined,
    nodeIds: string[],
    uptimeByNode: Record<string, number> = {},
  ): Record<string, string> {
    if (explicit && Object.keys(explicit).length > 0) return explicit;
    if (!this.reputation) {
      throw new AstError(
        AstErrorCode.INVALID_INPUT,
        'nodeWeights required when reputation service unavailable',
      );
    }
    return this.reputation.weightsFor(nodeIds, uptimeByNode);
  }

  settleCommission(input: SettleInput): {
    feeAro: string;
    nodePool: string;
    astReserve: string;
    payments: Record<string, string>;
    ledgerHeight: number;
  } {
    if (!this.pot.isVerified(input.processId)) {
      throw new AstError(AstErrorCode.POT_NOT_VERIFIED, 'settlement requires pot');
    }

    const fee = floorToArx(
      parseDecimal(input.valuation).times(parseDecimal(input.feeRate)),
    );
    const nodePool = floorToArx(fee.times(DEFAULT_NODE_SHARE));
    const astReserve = floorToArx(fee.times(DEFAULT_RESERVE_SHARE));

    const payments = this.distributeNodePayment(nodePool, input.nodeWeights);

    this.reserve.credit('AST_OWN', 'ARO_FEE', astReserve.toFixed(9));

    const rec = this.nodechain.append({
      writerRole: 'internal_service',
      processId: input.processId,
      recordType: 'commission_settled',
      payload: {
        feeAro: fee.toFixed(9),
        nodePool: nodePool.toFixed(9),
        astReserve: astReserve.toFixed(9),
        payments,
      },
    });

    return {
      feeAro: fee.toFixed(9),
      nodePool: nodePool.toFixed(9),
      astReserve: astReserve.toFixed(9),
      payments,
      ledgerHeight: rec.height,
    };
  }

  distributeNodePayment(
    pool: Dec,
    weights: Record<string, string>,
  ): Record<string, string> {
    let totalW = new Decimal(0);
    for (const w of Object.values(weights)) {
      totalW = totalW.plus(parseDecimal(w));
    }
    const out: Record<string, string> = {};
    if (totalW.lessThanOrEqualTo(0)) return out;
    for (const [nodeId, w] of Object.entries(weights)) {
      const pay = floorToArx(pool.times(parseDecimal(w)).dividedBy(totalW));
      out[nodeId] = pay.toFixed(9);
      const cur = this.nodePayments.get(nodeId) ?? new Decimal(0);
      this.nodePayments.set(nodeId, cur.plus(pay) as Dec);
    }
    return out;
  }
}
