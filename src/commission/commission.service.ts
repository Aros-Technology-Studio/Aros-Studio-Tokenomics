import { NodechainService } from '../nodechain/nodechain.service';
import { mulRate, split70_30 } from '../common/money';

/** Layer 06 — post-factum commission. Ship default 70% nodes / 30% AST. */
export class CommissionService {
  constructor(private readonly nodechain: NodechainService) {}

  /**
   * @param feeRate e.g. 0.0015 sandbox example
   * @param nodeWeights map nodeId -> weight (relative)
   */
  async settle(input: {
    processId: string;
    valuation: string;
    feeRate: number;
    nodeWeights: Record<string, number>;
    potVerified: 0 | 1;
  }): Promise<{
    fee: string;
    nodesPool: string;
    astShare: string;
    payments: Record<string, string>;
    split: { nodes: number; ast: number };
  }> {
    if (input.potVerified !== 1) {
      throw new Error('settle forbidden: pot not verified');
    }
    const fee = mulRate(input.valuation, input.feeRate);
    const { nodes: nodesPool, ast: astShare } = split70_30(fee);

    const totalW = Object.values(input.nodeWeights).reduce((a, b) => a + b, 0);
    const payments: Record<string, string> = {};
    if (totalW > 0) {
      const { parseAro, formatAro } = await import('../common/money');
      const pool = parseAro(nodesPool);
      let allocated = 0n;
      const entries = Object.entries(input.nodeWeights);
      entries.forEach(([nodeId, w], i) => {
        let share: bigint;
        if (i === entries.length - 1) {
          share = pool - allocated;
        } else {
          share = (pool * BigInt(Math.round(w * 1000))) / BigInt(Math.round(totalW * 1000));
          allocated += share;
        }
        payments[nodeId] = formatAro(share);
      });
    }

    await this.nodechain.append({
      clientRecordId: `commission:${input.processId}`,
      recordType: 'commission_settled',
      processId: input.processId,
      payload: {
        valuation: input.valuation,
        feeRate: input.feeRate,
        fee,
        nodesPool,
        astShare,
        split: { nodes: 0.7, ast: 0.3 },
        payments },
      writerId: 'settlement',
      writerRole: 'settlement' });

    for (const [nodeId, amount] of Object.entries(payments)) {
      await this.nodechain.append({
        clientRecordId: `pay:${input.processId}:${nodeId}`,
        recordType: 'payment_credited',
        processId: input.processId,
        payload: { nodeId, amount },
        writerId: 'settlement',
        writerRole: 'settlement' });
    }

    return {
      fee,
      nodesPool,
      astShare,
      payments,
      split: { nodes: 0.7, ast: 0.3 } };
  }
}
