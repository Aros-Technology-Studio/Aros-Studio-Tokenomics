import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { floorToArx, isAtLeastDust, parseDecimal } from '../common/money/money';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { InvariantsService } from '../invariants/invariants.service';
import { NodechainService } from '../nodechain/nodechain.service';
import { PotService } from '../pot/pot.service';

type Dec = InstanceType<typeof Decimal>;

export interface MintRequest {
  processId: string;
  claimId: string;
  amountAro: string;
  holderId: string;
}

/**
 * ARO token ledger (AST Token Protocol canonical layer in TS).
 * Mint only after PoT; no admin mint; NodeChain before ack.
 */
@Injectable()
export class AroscoinService {
  private balances = new Map<string, Dec>();
  private mintedProcessClaims = new Set<string>();

  constructor(
    private readonly pot: PotService,
    private readonly nodechain: NodechainService,
    private readonly invariants: InvariantsService,
  ) {}

  mint(req: MintRequest): { claimId: string; amountAro: string; ledgerHeight: number } {
    if (!this.pot.okToEmit(req.processId)) {
      throw new AstError(AstErrorCode.POT_NOT_VERIFIED, 'mint requires pot verified');
    }
    const key = `${req.processId}:${req.claimId}`;
    if (this.mintedProcessClaims.has(key)) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'double mint rejected');
    }
    if (!isAtLeastDust(req.amountAro) && parseDecimal(req.amountAro).greaterThan(0)) {
      // allow exact zero for emit-zero path
      if (!parseDecimal(req.amountAro).isZero()) {
        throw new AstError(AstErrorCode.INVALID_AMOUNT, 'below dust');
      }
    }

    const amount = floorToArx(req.amountAro);
    this.invariants.assertInvariant('I1', {
      potVerified: 1,
      isNewEmission: amount.greaterThan(0),
    });
    this.invariants.assertInvariant('I2', {
      isNewEmission: amount.greaterThan(0),
      emissionBoundToProcess: true,
    });

    const rec = this.nodechain.append({
      writerRole: 'internal_service',
      processId: req.processId,
      recordType: 'aro_mint',
      payload: {
        claimId: req.claimId,
        holderId: req.holderId,
        amountAro: amount.toFixed(9),
      },
    });

    const cur = this.balances.get(req.holderId) ?? new Decimal(0);
    this.balances.set(req.holderId, cur.plus(amount) as Dec);
    this.mintedProcessClaims.add(key);

    return {
      claimId: req.claimId,
      amountAro: amount.toFixed(9),
      ledgerHeight: rec.height,
    };
  }

  /** Explicitly refuse privileged mint paths (forbidden forever by canon). */
  refusePrivilegedMint(): never {
    throw new AstError(AstErrorCode.ADMIN_MINT_FORBIDDEN, 'privileged mint forbidden forever');
  }

  burn(req: {
    processId: string;
    holderId: string;
    amountAro: string;
    claimId: string;
  }): { ledgerHeight: number } {
    const amount = floorToArx(req.amountAro);
    const cur = this.balances.get(req.holderId) ?? new Decimal(0);
    if (cur.lessThan(amount)) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'insufficient balance');
    }
    this.invariants.assertInvariant('I2', {
      burnBoundToProcess: true,
      processId: req.processId,
    });
    const rec = this.nodechain.append({
      writerRole: 'internal_service',
      processId: req.processId,
      recordType: 'aro_burn',
      payload: {
        claimId: req.claimId,
        holderId: req.holderId,
        amountAro: amount.toFixed(9),
      },
    });
    this.balances.set(req.holderId, cur.minus(amount));
    return { ledgerHeight: rec.height };
  }

  balanceOf(holderId: string): string {
    return (this.balances.get(holderId) ?? new Decimal(0)).toFixed(9);
  }
}
