import { AstErrorCode } from './error-codes';

export class AstError extends Error {
  constructor(
    public readonly code: AstErrorCode | string,
    message?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message ?? code);
    this.name = 'AstError';
  }
}
