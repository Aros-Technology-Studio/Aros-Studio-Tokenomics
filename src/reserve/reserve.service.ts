import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { parseDecimal } from '../common/money/money';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { InvariantsService } from '../invariants/invariants.service';

export interface ReserveBag {
  bagId: string;
  /** Multi-asset book balances by asset key (fiat/crypto/claims). */
  balances: Record<string, string>;
  locked: Record<string, string>;
}

/**
 * AST own funds only (I6). NodeChain is primary truth; this is in-memory book.
 * reserveIndex = log10(1 + totalProcessVolume) (CANON §9.2).
 */
@Injectable()
export class ReserveService {
  private bags = new Map<string, ReserveBag>();
  private totalProcessVolume: InstanceType<typeof Decimal> = new Decimal(0);
  private childRecords: unknown[] = [];

  constructor(private readonly invariants: InvariantsService) {}

  ensureBag(bagId = 'AST_OWN'): ReserveBag {
    let bag = this.bags.get(bagId);
    if (!bag) {
      bag = { bagId, balances: {}, locked: {} };
      this.bags.set(bagId, bag);
    }
    return bag;
  }

  credit(bagId: string, assetKey: string, amount: string): void {
    this.invariants.assertInvariant('I6', {
      holdsThirdPartyFunds: false,
      holdsOnlyOwnFunds: true,
    });
    const bag = this.ensureBag(bagId);
    const cur = parseDecimal(bag.balances[assetKey] ?? '0');
    bag.balances[assetKey] = cur.plus(parseDecimal(amount)).toFixed();
  }

  /** Hard lock before mint — hard fail if insufficient. */
  lock(bagId: string, assetKey: string, amount: string): void {
    const bag = this.ensureBag(bagId);
    const avail = parseDecimal(bag.balances[assetKey] ?? '0').minus(
      parseDecimal(bag.locked[assetKey] ?? '0'),
    );
    const need = parseDecimal(amount);
    if (avail.lessThan(need)) {
      throw new AstError(AstErrorCode.INSUFFICIENT_RESERVE, 'insufficient reserve', {
        assetKey,
        need: need.toFixed(),
        avail: avail.toFixed(),
      });
    }
    bag.locked[assetKey] = parseDecimal(bag.locked[assetKey] ?? '0')
      .plus(need)
      .toFixed();
  }

  /** Partial release → child record (immutable history). */
  partialReleaseChild(parent: {
    bagId: string;
    assetKey: string;
    amount: string;
    processId: string;
  }): void {
    this.childRecords.push({ ...parent, at: new Date().toISOString() });
    const bag = this.ensureBag(parent.bagId);
    const locked = parseDecimal(bag.locked[parent.assetKey] ?? '0');
    const amt = parseDecimal(parent.amount);
    bag.locked[parent.assetKey] = locked.minus(amt).toFixed();
    bag.balances[parent.assetKey] = parseDecimal(bag.balances[parent.assetKey] ?? '0')
      .minus(amt)
      .toFixed();
  }

  recordConfirmedVolume(amount: string): void {
    this.totalProcessVolume = this.totalProcessVolume.plus(parseDecimal(amount));
  }

  /** reserveIndex = log10(1 + totalProcessVolume) */
  reserveIndex(): number {
    const v = this.totalProcessVolume;
    const x = new Decimal(1).plus(v);
    // log10 via ln/ln(10)
    return x.ln().div(new Decimal(10).ln()).toNumber();
  }

  getChildren(): unknown[] {
    return [...this.childRecords];
  }
}
