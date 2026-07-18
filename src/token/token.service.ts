import { NodechainService } from '../nodechain/nodechain.service';
import { parseAro, formatAro } from '../common/money';

/**
 * Layer 05 — ArosCoin balances + mint/burn facts. Mint only after pot verified=1.
 */
export class TokenService {
  private balances = new Map<string, bigint>();
  private mintedProcess = new Set<string>();

  constructor(private readonly nodechain: NodechainService) {}

  balanceOf(holderId: string): string {
    return formatAro(this.balances.get(holderId) ?? 0n);
  }

  async mintAfterPot(input: {
    processId: string;
    holderId: string;
    amount: string;
    potVerified: 0 | 1;
    potLedgerHeight: number;
  }): Promise<{ amount: string; height: number }> {
    if (input.potVerified !== 1) {
      throw new Error('mint forbidden: pot verified != 1');
    }
    if (this.mintedProcess.has(input.processId)) {
      throw new Error('double mint forbidden for process');
    }
    const arx = parseAro(input.amount);
    if (arx <= 0n) throw new Error('mint amount must be positive');

    const prev = this.balances.get(input.holderId) ?? 0n;
    this.balances.set(input.holderId, prev + arx);
    this.mintedProcess.add(input.processId);

    const r = await this.nodechain.append({
      clientRecordId: `mint:${input.processId}`,
      recordType: 'mint_fact',
      processId: input.processId,
      payload: {
        holderId: input.holderId,
        amount: input.amount,
        potLedgerHeight: input.potLedgerHeight },
      writerId: 'token',
      writerRole: 'token' });

    return { amount: input.amount, height: r.height };
  }

  async burn(input: {
    processId: string;
    holderId: string;
    amount: string;
  }): Promise<void> {
    const arx = parseAro(input.amount);
    const prev = this.balances.get(input.holderId) ?? 0n;
    if (prev < arx) throw new Error('insufficient balance');
    this.balances.set(input.holderId, prev - arx);
    await this.nodechain.append({
      clientRecordId: `burn:${input.processId}:${Date.now()}`,
      recordType: 'burn_fact',
      processId: input.processId,
      payload: { holderId: input.holderId, amount: input.amount },
      writerId: 'token',
      writerRole: 'token' });
  }
}
