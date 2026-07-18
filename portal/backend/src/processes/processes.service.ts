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
import { CoreApiClient } from '../core-client';

export interface CreateResult {
  statusCode: number;
  body: Record<string, unknown>;
}

/**
 * Portal edge process service.
 * Validates institutional valuation + qualified signature, then hands off to Core
 * Orchestrator via /v1/core/processes when CORE_API_URL is reachable.
 */
@Injectable()
export class ProcessesService {
  private readonly byId = new Map<string, ProcessRecord>();
  private readonly byIdem = new Map<string, { processId: string; fingerprint: string }>();
  private readonly core: CoreApiClient;

  constructor(core?: CoreApiClient) {
    this.core = core ?? new CoreApiClient();
  }

  async create(
    body: CreateProcessBody,
    institutionId: string | undefined,
    idempotencyKey: string | undefined,
  ): Promise<CreateResult> {
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

    // Hand-off to Core Orchestrator (sole economic entry)
    if (this.core.enabled) {
      const coreRes = await this.core.createProcess(
        {
          processType: body.processType,
          valuation: rec.valuation,
          holderId: rec.holderId,
          assetId: rec.assetId,
          processId,
          hasQualifiedSignature: true,
          documentPackageHash: rec.documentPackageHash,
          hasDocuments: true,
          institutionAllowlisted: true,
          note: body.note,
        },
        { institutionId: inst, idempotencyKey: key },
      );

      if (coreRes.statusCode >= 200 && coreRes.statusCode < 300) {
        rec.status = 'submitted_to_core';
        rec.updatedAt = new Date().toISOString();
        return {
          statusCode: 202,
          body: {
            ...this.toAccepted(rec, 'submitted_to_core'),
            core: coreRes.body,
            message: 'Edge validated; Core Orchestrator completed primary path',
          },
        };
      }

      // Core down / error: keep edge record as awaiting_core (no mint at edge)
      rec.status = 'awaiting_core';
      rec.updatedAt = new Date().toISOString();
      return {
        statusCode: 202,
        body: {
          ...this.toAccepted(rec, 'awaiting_core'),
          coreError: coreRes.body,
          message:
            'Accepted at edge; Core hand-off failed or unavailable — no mint from portal',
        },
      };
    }

    return {
      statusCode: 202,
      body: this.toAccepted(rec, 'awaiting_core'),
    };
  }

  async get(processId: string, institutionId: string | undefined): Promise<CreateResult> {
    // Prefer Core status when available
    if (this.core.enabled) {
      const coreRes = await this.core.getProcess(processId, institutionId);
      if (coreRes.statusCode === 200) {
        const edge = this.byId.get(processId);
        if (edge) {
          edge.status = 'submitted_to_core';
          edge.updatedAt = new Date().toISOString();
        }
        return {
          statusCode: 200,
          body: {
            ...coreRes.body,
            source: 'core',
          },
        };
      }
      if (coreRes.statusCode === 404 && !this.byId.has(processId)) {
        return this.error({ code: 'NOT_FOUND', message: `unknown process ${processId}` }, 404);
      }
    }

    const rec = this.byId.get(processId);
    if (!rec) {
      return this.error({ code: 'NOT_FOUND', message: `unknown process ${processId}` }, 404);
    }
    if (institutionId && rec.institutionId !== institutionId) {
      return this.error({ code: 'FORBIDDEN', message: 'institution mismatch' }, 403);
    }
    return { statusCode: 200, body: { ...this.toStatus(rec), source: 'edge' } };
  }

  async attachDocuments(
    processId: string,
    body: AttachDocumentsBody,
    institutionId: string | undefined,
    idempotencyKey: string | undefined,
  ): Promise<CreateResult> {
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
        status === 'submitted_to_core'
          ? 'Handed off to Core Orchestrator'
          : 'Accepted at edge; awaiting Core Orchestrator',
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
