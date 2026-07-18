import { createHash } from 'crypto';

/**
 * Deterministic digest for multi-oracle signatures.
 * Domain-separated; sorted keys via fixed field order.
 */
export function oracleAttestationDigest(input: {
  oracleId: string;
  processId: string;
  observedValue?: string;
  asOfUtc: string;
  note?: string;
}): string {
  const material = JSON.stringify({
    domain: 'AST-ORACLE-ATTEST-v1',
    asOfUtc: input.asOfUtc,
    note: input.note ?? '',
    observedValue: input.observedValue ?? '',
    oracleId: input.oracleId,
    processId: input.processId,
  });
  return createHash('sha256').update(material, 'utf8').digest('hex');
}
