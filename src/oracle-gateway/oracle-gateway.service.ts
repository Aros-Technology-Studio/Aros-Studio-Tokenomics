import type { KeyRegistry } from '../common/crypto/key-registry';
import type { NodechainService } from '../nodechain/nodechain.service';
import { oracleAttestationDigest } from './digest';
import { OracleError, OracleErrorCode } from './errors';
import type { OracleAttestation, OraclePackage, OracleVerifyResult } from './types';

/**
 * Multi-oracle gateway: Ed25519 attestations, fail-closed.
 * Does not mint or set institutional valuation (Canon: no system self-appraisal).
 * Observational cross-check only.
 */
export class OracleGatewayService {
  private readonly registered = new Set<string>();
  private readonly minOracles: number;

  constructor(
    private readonly keys: KeyRegistry,
    private readonly nodechain?: NodechainService,
    opts?: { minOracles?: number },
  ) {
    this.minOracles = Math.max(1, opts?.minOracles ?? 2);
  }

  registerOracle(oracleId: string): void {
    if (!oracleId?.trim()) throw new Error('oracleId required');
    this.registered.add(oracleId.trim());
    if (!this.keys.getPublic(oracleId) && !this.keys.hasPrivate(oracleId)) {
      // allow pre-registered public-only or generate for sandbox
      if (!this.keys.hasPrivate(oracleId)) {
        this.keys.registerGenerated(oracleId);
      }
    }
  }

  registerMany(ids: string[]): void {
    for (const id of ids) this.registerOracle(id);
  }

  listOracles(): string[] {
    return [...this.registered].sort();
  }

  /** Sign helper for tests / sandbox oracles that hold private keys in registry. */
  signAttestation(
    oracleId: string,
    payload: OracleAttestation['payload'],
  ): OracleAttestation {
    const digest = oracleAttestationDigest({
      oracleId,
      processId: payload.processId,
      observedValue: payload.observedValue,
      asOfUtc: payload.asOfUtc,
      note: payload.note,
    });
    const sig = this.keys.sign(oracleId, digest);
    return {
      oracleId,
      payload,
      signature: sig.signature,
    };
  }

  /**
   * Verify multi-oracle package. Fail-closed: any path to !ok must not be treated as pass.
   */
  verify(pkg: OraclePackage): OracleVerifyResult {
    const reasonCodes: string[] = [];
    const validOracleIds: string[] = [];
    const invalidOracleIds: string[] = [];

    if (!pkg?.processId?.trim()) {
      return emptyFail('', this.minOracles, ['ORACLE_PROCESS_REQUIRED']);
    }
    if (!pkg.attestations?.length) {
      return emptyFail(pkg.processId, this.minOracles, [OracleErrorCode.EMPTY]);
    }

    const digests: string[] = [];
    for (const att of pkg.attestations) {
      if (att.payload.processId !== pkg.processId) {
        invalidOracleIds.push(att.oracleId);
        reasonCodes.push(OracleErrorCode.PROCESS_MISMATCH);
        continue;
      }
      if (this.registered.size > 0 && !this.registered.has(att.oracleId)) {
        invalidOracleIds.push(att.oracleId);
        reasonCodes.push(OracleErrorCode.UNKNOWN_ORACLE);
        continue;
      }
      const digest = oracleAttestationDigest({
        oracleId: att.oracleId,
        processId: att.payload.processId,
        observedValue: att.payload.observedValue,
        asOfUtc: att.payload.asOfUtc,
        note: att.payload.note,
      });
      digests.push(digest);
      const ok = this.keys.verify(
        {
          signerId: att.oracleId,
          algorithm: 'ed25519',
          signature: att.signature,
          signedOver: 'contentHash',
        },
        digest,
      );
      if (ok) {
        if (!validOracleIds.includes(att.oracleId)) validOracleIds.push(att.oracleId);
      } else {
        invalidOracleIds.push(att.oracleId);
        reasonCodes.push(OracleErrorCode.BAD_SIGNATURE);
      }
    }

    const ok = validOracleIds.length >= this.minOracles;
    if (!ok) {
      reasonCodes.push(OracleErrorCode.INSUFFICIENT);
      reasonCodes.push(OracleErrorCode.FAIL_CLOSED);
    }

    return {
      ok,
      processId: pkg.processId,
      required: this.minOracles,
      validOracleIds: validOracleIds.sort(),
      invalidOracleIds: [...new Set(invalidOracleIds)].sort(),
      reasonCodes: [...new Set(reasonCodes)],
      digest: digests[0] ?? '',
    };
  }

  /** Fail-closed assert — throws OracleError if verification fails. */
  require(pkg: OraclePackage): OracleVerifyResult {
    const r = this.verify(pkg);
    if (!r.ok) {
      throw new OracleError(
        OracleErrorCode.FAIL_CLOSED,
        `oracle fail-closed: valid=${r.validOracleIds.length}/${r.required}`,
        r.reasonCodes,
      );
    }
    return r;
  }

  async journalReport(
    processId: string,
    result: OracleVerifyResult,
    extra?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.nodechain) return;
    await this.nodechain.append({
      clientRecordId: `oracle-report:${processId}`,
      recordType: 'oracle_report',
      processId,
      payload: {
        schemaVersion: 'oracle-1',
        ok: result.ok,
        required: result.required,
        validOracleIds: result.validOracleIds,
        invalidOracleIds: result.invalidOracleIds,
        reasonCodes: result.reasonCodes,
        digest: result.digest,
        ...extra,
      },
      writerId: 'system',
      writerRole: 'system',
    });
  }
}

function emptyFail(
  processId: string,
  required: number,
  reasonCodes: string[],
): OracleVerifyResult {
  return {
    ok: false,
    processId,
    required,
    validOracleIds: [],
    invalidOracleIds: [],
    reasonCodes,
    digest: '',
  };
}
