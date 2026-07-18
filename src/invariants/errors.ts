import type { InvariantId } from './codes';
import { INVARIANT_TEXT } from './codes';

export class InvariantError extends Error {
  constructor(
    public readonly invariant: InvariantId,
    message?: string,
    public readonly details?: string[],
  ) {
    super(message ?? INVARIANT_TEXT[invariant]);
    this.name = 'InvariantError';
  }
}
