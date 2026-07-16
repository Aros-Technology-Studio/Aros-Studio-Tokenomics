import { createHash, createVerify } from 'crypto';
import { Injectable } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { NodechainService } from '../nodechain/nodechain.service';
import { OracleAttestation, OracleGatewayResult } from './oracle-gateway.types';

/**
 * Multi-oracle + signature verification (oracle-gateway pack).
 * Transport only — AST does not invent institutional valuation.
 * Failure → fail-closed (process expired path for orchestrator).
 */
@Injectable()
export class OracleGatewayService {
  /** Default: need at least 2 distinct valid oracles when called. */
  private requiredCount = 2;

  constructor(private readonly nodechain: NodechainService) {}

  setRequiredCount(n: number): void {
    this.requiredCount = Math.max(1, n);
  }

  /**
   * Verify attestations. Uses Node crypto verify when possible;
   * for test stubs, accepts signature === sha256(payload|oracleId) hex.
   */
  submit(
    processId: string,
    attestations: OracleAttestation[],
  ): OracleGatewayResult {
    const accepted: OracleAttestation[] = [];
    const seen = new Set<string>();

    for (const a of attestations) {
      if (seen.has(a.oracleId)) continue;
      if (!this.verifyAttestation(a)) continue;
      seen.add(a.oracleId);
      accepted.push(a);
    }

    if (accepted.length < this.requiredCount) {
      return {
        ok: false,
        processId,
        acceptedCount: accepted.length,
        requiredCount: this.requiredCount,
        reasonCode: 'ORACLE_QUORUM_FAILED',
      };
    }

    this.nodechain.append({
      writerRole: 'internal_service',
      processId,
      recordType: 'oracle_gateway_accepted',
      payload: {
        oracleIds: accepted.map((x) => x.oracleId),
        count: accepted.length,
      },
    });

    return {
      ok: true,
      processId,
      acceptedCount: accepted.length,
      requiredCount: this.requiredCount,
    };
  }

  /** Fail-closed helper for orchestrator: throw → process expired. */
  requireOk(processId: string, attestations: OracleAttestation[]): void {
    const r = this.submit(processId, attestations);
    if (!r.ok) {
      throw new AstError(AstErrorCode.POT_EXPIRED, 'oracle gateway fail-closed', {
        ...r,
      });
    }
  }

  private verifyAttestation(a: OracleAttestation): boolean {
    const body = JSON.stringify(a.payload) + '|' + a.oracleId;
    const digest = createHash('sha256').update(body).digest('hex');

    // Deterministic test/stub signature path
    if (a.signature === digest || a.signature === `stub:${digest}`) {
      return true;
    }

    // Real asymmetric verify when publicKey looks like PEM
    if (a.publicKey.includes('BEGIN PUBLIC KEY')) {
      try {
        const v = createVerify('SHA256');
        v.update(body);
        v.end();
        return v.verify(a.publicKey, Buffer.from(a.signature, 'base64'));
      } catch {
        return false;
      }
    }

    return false;
  }
}

/** Helper for tests to build stub signatures. */
export function stubOracleSignature(payload: unknown, oracleId: string): string {
  const body = JSON.stringify(payload) + '|' + oracleId;
  return createHash('sha256').update(body).digest('hex');
}
