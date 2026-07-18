/**
 * Confirmer/validator eligibility for PoT quorum.
 * Standing is explicit registration — not stake / ARO weight.
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

  static fromActiveIds(ids: string[]): ValidatorRegistry {
    const reg = new ValidatorRegistry();
    reg.registerMany(ids);
    return reg;
  }

  register(validatorId: string): ValidatorRecord {
    if (!validatorId.trim()) {
      throw new Error('validatorId required');
    }
    const existing = this.byId.get(validatorId);
    if (existing) {
      if (existing.status === 'suspended') {
        // re-register restores standing
        existing.status = 'active';
        existing.suspendedAtUtc = undefined;
        existing.reason = undefined;
      }
      return { ...existing };
    }
    const row: ValidatorRecord = {
      validatorId,
      status: 'active',
      registeredAtUtc: new Date().toISOString(),
    };
    this.byId.set(validatorId, row);
    return { ...row };
  }

  registerMany(ids: string[]): void {
    for (const id of ids) this.register(id);
  }

  suspend(validatorId: string, reason: string): ValidatorRecord {
    const row = this.require(validatorId);
    row.status = 'suspended';
    row.suspendedAtUtc = new Date().toISOString();
    row.reason = reason?.trim() || 'suspended';
    return { ...row };
  }

  restore(validatorId: string): ValidatorRecord {
    const row = this.require(validatorId);
    row.status = 'active';
    row.suspendedAtUtc = undefined;
    row.reason = undefined;
    return { ...row };
  }

  isActive(validatorId: string): boolean {
    return this.byId.get(validatorId)?.status === 'active';
  }

  isSuspended(validatorId: string): boolean {
    return this.byId.get(validatorId)?.status === 'suspended';
  }

  listActive(): string[] {
    return [...this.byId.values()]
      .filter((v) => v.status === 'active')
      .map((v) => v.validatorId)
      .sort();
  }

  listSuspended(): string[] {
    return [...this.byId.values()]
      .filter((v) => v.status === 'suspended')
      .map((v) => v.validatorId)
      .sort();
  }

  listAll(): ValidatorRecord[] {
    return [...this.byId.values()].map((v) => ({ ...v }));
  }

  /**
   * Eligible set = intersection of proposed validatorIds with active registry.
   * If registry empty, proposed list is used as-is (bootstrap mode for tests).
   */
  resolveEligible(proposed: string[]): string[] {
    if (this.byId.size === 0) {
      return [...new Set(proposed.filter(Boolean))];
    }
    return [...new Set(proposed.filter(Boolean))].filter((id) => this.isActive(id));
  }

  private require(validatorId: string): ValidatorRecord {
    const row = this.byId.get(validatorId);
    if (!row) throw new Error(`unknown validator ${validatorId}`);
    return row;
  }
}
