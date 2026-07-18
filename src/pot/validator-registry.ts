/**
 * Confirmer/validator eligibility for PoT quorum.
 * Standing is explicit registration — not stake.
 */

export type ValidatorStatus = 'active' | 'suspended';

export interface ValidatorRecord {
  validatorId: string;
  status: ValidatorStatus;
  registeredAtUtc: string;
  suspendedAtUtc?: string;
  reason?: string;
}

export class ValidatorRegistry {
  private readonly byId = new Map<string, ValidatorRecord>();

  register(validatorId: string): ValidatorRecord {
    if (!validatorId.trim()) {
      throw new Error('validatorId required');
    }
    const row: ValidatorRecord = {
      validatorId,
      status: 'active',
      registeredAtUtc: new Date().toISOString(),
    };
    this.byId.set(validatorId, row);
    return row;
  }

  registerMany(ids: string[]): void {
    for (const id of ids) this.register(id);
  }

  suspend(validatorId: string, reason: string): void {
    const row = this.require(validatorId);
    row.status = 'suspended';
    row.suspendedAtUtc = new Date().toISOString();
    row.reason = reason;
  }

  restore(validatorId: string): void {
    const row = this.require(validatorId);
    row.status = 'active';
    row.suspendedAtUtc = undefined;
    row.reason = undefined;
  }

  isActive(validatorId: string): boolean {
    return this.byId.get(validatorId)?.status === 'active';
  }

  listActive(): string[] {
    return [...this.byId.values()]
      .filter((v) => v.status === 'active')
      .map((v) => v.validatorId)
      .sort();
  }

  listAll(): ValidatorRecord[] {
    return [...this.byId.values()];
  }

  /**
   * Eligible set = intersection of proposed validatorIds with active registry.
   * If registry empty, proposed list is used as-is (bootstrap mode for tests that pass explicit sets).
   */
  resolveEligible(proposed: string[]): string[] {
    if (this.byId.size === 0) {
      return [...new Set(proposed)];
    }
    return [...new Set(proposed)].filter((id) => this.isActive(id));
  }

  private require(validatorId: string): ValidatorRecord {
    const row = this.byId.get(validatorId);
    if (!row) throw new Error(`unknown validator ${validatorId}`);
    return row;
  }
}
