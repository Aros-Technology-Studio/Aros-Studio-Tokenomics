import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode, InvariantId } from '../common/errors/error-codes';
import {
  ALL_INVARIANT_IDS,
  INVARIANT_PREDICATES,
  versionedId,
} from './invariant.registry';
import { InvariantContext, InvariantResult } from './invariant.types';

export const INVARIANT_BROKEN_EVENT = 'InvariantBroken';

@Injectable()
export class InvariantsService {
  constructor(private readonly events: EventEmitter2) {}

  checkAll(ctx: InvariantContext): InvariantResult[] {
    return ALL_INVARIANT_IDS.map((id) => this.evaluate(id, ctx));
  }

  /**
   * Write-path guard: fail closed on broken invariant.
   * Does not grant Eye veto — caller stops side effects.
   */
  assertInvariant(id: InvariantId, ctx: InvariantContext): void {
    const result = this.evaluate(id, ctx);
    if (!result.ok) {
      this.events.emit(INVARIANT_BROKEN_EVENT, {
        ...result,
        context: ctx,
        at: new Date().toISOString(),
      });
      throw new AstError(AstErrorCode.INVARIANT_BROKEN, `Invariant ${id} broken`, {
        invariantId: id,
        versionedId: result.versionedId,
        reasonCode: result.reasonCode,
      });
    }
  }

  assertAll(ctx: InvariantContext): void {
    for (const id of ALL_INVARIANT_IDS) {
      this.assertInvariant(id, ctx);
    }
  }

  private evaluate(id: InvariantId, ctx: InvariantContext): InvariantResult {
    if (ctx.killSwitchActive && (id === 'I1' || id === 'I2')) {
      // Kill switch: block new economic causes (CANON §XII)
      if (ctx.isNewEmission) {
        return {
          id,
          versionedId: versionedId(id),
          ok: false,
          reasonCode: AstErrorCode.KILL_SWITCH_ACTIVE,
        };
      }
    }
    const ok = INVARIANT_PREDICATES[id](ctx);
    return {
      id,
      versionedId: versionedId(id),
      ok,
      reasonCode: ok ? undefined : `E_${id}_BROKEN`,
    };
  }
}
