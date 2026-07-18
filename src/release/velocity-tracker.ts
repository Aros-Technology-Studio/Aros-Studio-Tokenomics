import type { NodechainService } from '../nodechain/nodechain.service';
import { parseAro, formatAro } from '../common/money';

/**
 * Canon §9.6: velocity = processVolume_24h / circulatingSupply
 */
export class VelocityTracker {
  constructor(private readonly nodechain: NodechainService) {}

  /**
   * @param circulatingSupply ARO decimal string (ArosCoin total supply)
   * @param nowMs evaluation time
   * @param windowMs lookback (default 24h)
   */
  async compute(
    circulatingSupply: string,
    nowMs = Date.now(),
    windowMs = 24 * 60 * 60 * 1000,
  ): Promise<{
    velocity: number;
    processVolume24h: string;
    circulatingSupply: string;
  }> {
    const supply = parseAro(circulatingSupply);
    const all = await this.nodechain.listAll();
    const since = nowMs - windowMs;
    let volume = 0n;

    for (const r of all) {
      const t = Date.parse(r.timestampUtc);
      if (!Number.isFinite(t) || t < since) continue;
      if (r.recordType === 'mint_fact' || r.recordType === 'emission_fact') {
        const amount = String(r.payload.amount ?? r.payload.valuation ?? '0');
        try {
          volume += parseAro(amount);
        } catch {
          /* skip */
        }
      }
      if (r.recordType === 'pot_verdict' && r.payload.verified === 1) {
        // count confirmed process open valuation if present on process_open
      }
    }

    // Also count process_open valuations for confirmed processes in window
    for (const r of all) {
      if (r.recordType !== 'process_open') continue;
      const t = Date.parse(r.timestampUtc);
      if (!Number.isFinite(t) || t < since) continue;
      const valuation = String(r.payload.valuation ?? '0');
      try {
        volume += parseAro(valuation);
      } catch {
        /* skip */
      }
    }

    const processVolume24h = formatAro(volume);
    if (supply <= 0n) {
      // No circulating supply yet: activity without float is treated as unbounded velocity signal
      return {
        velocity: volume > 0n ? Number.POSITIVE_INFINITY : 0,
        processVolume24h,
        circulatingSupply,
      };
    }
    // velocity as dimensionless ratio (arx/arx)
    const velocity = Number(volume) / Number(supply);
    return {
      velocity: Number.isFinite(velocity) ? velocity : 0,
      processVolume24h,
      circulatingSupply,
    };
  }
}
