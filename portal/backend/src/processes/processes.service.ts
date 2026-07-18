import { Injectable } from '@nestjs/common';
import {
  makeProcessId,
  payloadFingerprint,
  validateCreateProcess,
  isValidDocumentPackageHash,
  type AttachDocumentsBody,
  type CreateProcessBody,
  type PortalErrorBody,
  type ProcessRecord,
} from '../shared-bridge';

export interface CreateResult {
  statusCode: number;
  body: Record<string, unknown>;
}

/**
 * Edge process store (in-memory stub).
 * Does not mint; Core Orchestrator hand-off is stubbed as awaiting_core.
 */
@Injectable()
export class ProcessesService {
  private readonly byId = new Map<string, ProcessRecord>();
  /** institutionId + idempotencyKey → processId */
  private readonly byIdem = new Map<string, { processId: string; fingerprint: string }>();

  create(
    body: CreateProcessBody,
    institutionId: string | undefined,
    idempotencyKey: string | undefined,
  ): CreateResult {
    const err = validateCreateProcess(body, idempotencyKey, institutionId);
    if (err) return this.error(err, err.code === 'FORBIDDEN' ? 403 : 422);

    const inst = institutionId!.trim();
    const key = idempotencyKey!.trim();
    const fingerprint = payloadFingerprint({
      processType: body.processType,
      valuation: body.valuation,
      holderId: body.holderId,
      assetId: body.assetId,
      hasQualifiedSignature: body.hasQualifiedSignature,
      documentPackageHash: body.documentPackageHash.toLowerCase(),
      note: body.note,
    });

    const idemScope = `${inst}::${key}`;
    const existing = this.byIdem.get(idemScope);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        return this.error(
          {
            code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
            message: 'Idempotency-Key reused with different payload',
          },
          409,
        );
      }
      const rec = this.byId.get(existing.processId)!;
      return {
        statusCode: 202,
        body: this.toAccepted(rec, 'duplicate'),
      };
    }

    const processId = body.processId?.trim() || makeProcessId(inst);
    if (this.byId.has(processId)) {
      return this.error(
        {
          code: 'VALIDATION_ERROR',
          message: `processId already exists on edge: ${processId}`,
        },
        409,
      );
    }

    const now = new Date().toISOString();
    const rec: ProcessRecord = {
      processId,
      institutionId: inst,
      processType: body.processType,
      status: 'awaiting_core',
      valuation: body.valuation.trim(),
      holderId: body.holderId.trim(),
      assetId: body.assetId,
      hasQualifiedSignature: true,
      documentPackageHash: body.documentPackageHash.toLowerCase(),
      idempotencyKey: key,
      payloadFingerprint: fingerprint,
      createdAt: now,
      updatedAt: now,
      note: body.note,
    };
    this.byId.set(processId, rec);
    this.byIdem.set(idemScope, { processId, fingerprint });

    // Stub: no call to TokenizationPipeline / mint
    return {
      statusCode: 202,
      body: this.toAccepted(rec, 'awaiting_core'),
    };
  }

  get(processId: string, institutionId: string | undefined): CreateResult {
    const rec = this.byId.get(processId);
    if (!rec) {
      return this.error({ code: 'NOT_FOUND', message: `unknown process ${processId}` }, 404);
    }
    if (institutionId && rec.institutionId !== institutionId) {
      return this.error({ code: 'FORBIDDEN', message: 'institution mismatch' }, 403);
    }
    return { statusCode: 200, body: this.toStatus(rec) };
  }

  attachDocuments(
    processId: string,
    body: AttachDocumentsBody,
    institutionId: string | undefined,
    idempotencyKey: string | undefined,
  ): CreateResult {
    if (!idempotencyKey?.trim()) {
      return this.error(
        { code: 'IDEMPOTENCY_REQUIRED', message: 'Idempotency-Key required' },
        422,
      );
    }
    const rec = this.byId.get(processId);
    if (!rec) {
      return this.error({ code: 'NOT_FOUND', message: `unknown process ${processId}` }, 404);
    }
    if (institutionId && rec.institutionId !== institutionId) {
      return this.error({ code: 'FORBIDDEN', message: 'institution mismatch' }, 403);
    }
    if (body.hasQualifiedSignature !== true) {
      return this.error(
        {
          code: 'MISSING_QUALIFIED_SIGNATURE',
          message: 'hasQualifiedSignature must be true',
        },
        422,
      );
    }
    if (!isValidDocumentPackageHash(body.documentPackageHash)) {
      return this.error(
        {
          code: 'MISSING_DOCUMENTS',
          message: 'documentPackageHash required (64 hex)',
        },
        422,
      );
    }
    rec.documentPackageHash = body.documentPackageHash.toLowerCase();
    rec.hasQualifiedSignature = true;
    rec.status = 'awaiting_core';
    rec.updatedAt = new Date().toISOString();
    return { statusCode: 200, body: this.toStatus(rec) };
  }

  private toAccepted(rec: ProcessRecord, status: string) {
    return {
      processId: rec.processId,
      idempotencyKey: rec.idempotencyKey,
      status,
      institutionId: rec.institutionId,
      valuation: rec.valuation,
      hasQualifiedSignature: rec.hasQualifiedSignature,
      documentPackageHash: rec.documentPackageHash,
      message:
        'Accepted at edge; Core Orchestrator hand-off is stub in scaffold (no mint from portal)',
    };
  }

  private toStatus(rec: ProcessRecord) {
    return {
      processId: rec.processId,
      status: rec.status,
      institutionId: rec.institutionId,
      valuation: rec.valuation,
      hasQualifiedSignature: rec.hasQualifiedSignature,
      documentPackageHash: rec.documentPackageHash,
      idempotencyKey: rec.idempotencyKey,
      updatedAt: rec.updatedAt,
    };
  }

  private error(body: PortalErrorBody, statusCode: number): CreateResult {
    return { statusCode, body };
  }
}
