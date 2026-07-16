import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { parseDecimal } from '../common/money/money';

/**
 * velocity = processVolume_24h / circulatingSupply (CANON §9.6).
 */
@Injectable()
export class VelocityTrackerService {
  private volume24h = new Decimal(0);
  private circulatingSupply = new Decimal(0);

  setVolume24h(v: string): void {
    this.volume24h = parseDecimal(v);
  }

  setCirculatingSupply(v: string): void {
    this.circulatingSupply = parseDecimal(v);
  }

  addVolume(delta: string): void {
    this.volume24h = this.volume24h.plus(parseDecimal(delta));
  }

  velocity(): number {
    if (this.circulatingSupply.lessThanOrEqualTo(0)) return 0;
    return this.volume24h.div(this.circulatingSupply).toNumber();
  }
}
