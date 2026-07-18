import { NodechainService } from '../nodechain/nodechain.service';
import { parseAro, formatAro } from '../common/money';

/**
 * Layer 07 — AST own reserve only. reserveIndex = log10(1 + totalProcessVolume).
 */
export class ReserveService {
  private ownArx = 0n;
  private totalProcessVolumeArx = 0n;

  constructor(private readonly nodechain: NodechainService) {}

  ownBalance(): string {
    return formatAro(this.ownArx);
  }

  reserveIndex(): number {
    // volume in whole ARO units for index (approx)
    const vol = Number(this.totalProcessVolumeArx) / 1e9;
    return Math.log10(1 + Math.max(0, vol));
  }

  async accrueFromCommission(input: {
    processId: string;
    astShare: string;
    processValuation: string;
  }): Promise<{ ownBalance: string; reserveIndex: number }> {
    const share = parseAro(input.astShare);
    this.ownArx += share;
    this.totalProcessVolumeArx += parseAro(input.processValuation);

    await this.nodechain.append({
      clientRecordId: `reserve-accrual:${input.processId}`,
      recordType: 'param_change',
      processId: input.processId,
      payload: {
        kind: 'reserve_accrual',
        astShare: input.astShare,
        ownBalance: formatAro(this.ownArx),
        reserveIndex: this.reserveIndex(),
        note: 'AST own funds only — no third-party custody' },
      writerId: 'system',
      writerRole: 'system' });

    return { ownBalance: formatAro(this.ownArx), reserveIndex: this.reserveIndex() };
  }
}
