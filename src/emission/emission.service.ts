import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { floorToArx, parseDecimal } from '../common/money/money';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { InvariantsService } from '../invariants/invariants.service';
import { PotService } from '../pot/pot.service';

export interface EmissionPlanInput {
  processId: string;
  /** Institutional valuation (decimal string). AST does not compute this. */
  institutionalValuation: string;
  /** Confirmed change; 0 → emit zero path. */
  deltaValue: string;
  previousValue?: string;
  /** Holder balances for I9 pro-rata (claimId → amount string). */
  holders?: Record<string, string>;
  assetClassCapAro?: string;
}

export interface EmissionPlan {
  processId: string;
  mintAro: string;
  burnAro: string;
  proRata?: Record<string, string>;
}

/**
 * Valuation + ΔValue model (CANON / emission pack). No α·TV+β·U+γ.
 * Does not mint itself when aroscoin is separate — plan only until aroscoin wired;
 * here we expose plan + will call mint via injected callback later.
 */
@Injectable()
export class EmissionService {
  constructor(
    private readonly pot: PotService,
    private readonly invariants: InvariantsService,
  ) {}

  plan(input: EmissionPlanInput): EmissionPlan {
    if (!this.pot.okToEmit(input.processId)) {
      throw new AstError(AstErrorCode.POT_NOT_VERIFIED, 'emission requires pot verified=1', {
        processId: input.processId,
      });
    }

    const delta = parseDecimal(input.deltaValue);
    let mint = new Decimal(0);
    let burn = new Decimal(0);

    if (delta.greaterThan(0)) {
      // Value-up: proportional supply change uses previous_value when provided
      if (input.previousValue) {
        const prev = parseDecimal(input.previousValue);
        if (prev.lessThanOrEqualTo(0)) {
          mint = floorToArx(delta);
        } else {
          // new_supply factor applied by caller; here mint amount = f(Δ/prev)*base supply
          // For primary tokenization, previous may equal valuation → mint = valuation
          mint = floorToArx(parseDecimal(input.institutionalValuation));
        }
      } else {
        // Primary path: mint equals institutional valuation floor
        mint = floorToArx(parseDecimal(input.institutionalValuation));
      }
    } else if (delta.lessThan(0)) {
      burn = floorToArx(delta.abs());
    }
    // delta == 0 → emit zero

    if (input.assetClassCapAro) {
      const cap = parseDecimal(input.assetClassCapAro);
      if (mint.greaterThan(cap)) {
        throw new AstError(AstErrorCode.INVALID_AMOUNT, 'emission cap exceeded', {
          mint: mint.toFixed(),
          cap: cap.toFixed(),
        });
      }
    }

    let proRata: Record<string, string> | undefined;
    if (mint.greaterThan(0) && input.holders && Object.keys(input.holders).length > 0) {
      proRata = computeProRata(mint, input.holders);
    }

    this.invariants.assertInvariant('I1', {
      potVerified: 1,
      isNewEmission: mint.greaterThan(0),
      processId: input.processId,
    });
    this.invariants.assertInvariant('I2', {
      isNewEmission: mint.greaterThan(0),
      emissionBoundToProcess: true,
      processId: input.processId,
    });
    if (mint.greaterThan(0) && proRata) {
      this.invariants.assertInvariant('I9', {
        isNewEmission: true,
        newEmissionProRata: true,
      });
    }

    return {
      processId: input.processId,
      mintAro: mint.toFixed(9),
      burnAro: burn.toFixed(9),
      proRata,
    };
  }
}

type Dec = InstanceType<typeof Decimal>;

function computeProRata(
  mint: Dec,
  holders: Record<string, string>,
): Record<string, string> {
  let total = new Decimal(0);
  for (const v of Object.values(holders)) {
    total = total.plus(parseDecimal(v));
  }
  if (total.lessThanOrEqualTo(0)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [id, v] of Object.entries(holders)) {
    const share = mint.times(parseDecimal(v)).dividedBy(total);
    out[id] = floorToArx(share).toFixed(9);
  }
  return out;
}
