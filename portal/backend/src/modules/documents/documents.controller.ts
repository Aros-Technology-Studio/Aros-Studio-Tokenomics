import {
  Body,
  Controller,
  Headers,
  HttpException,
  Inject,
  Post,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { AuthService } from '../auth/auth.service';
import { ProcessesService } from '../processes/processes.service';

/**
 * Document package at the edge (SHA-256 + signature attestation).
 * Does not store PII documents as NodeChain SoT.
 */
@Controller('v1/documents')
export class DocumentsController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ProcessesService) private readonly processes: ProcessesService,
  ) {}

  @Post('hash')
  hash(
    @Headers('x-session-id') sessionId: string | undefined,
    @Body()
    body: {
      parts?: Array<{ name: string; content: string; encoding?: 'utf8' | 'base64' }>;
      rawPackage?: string;
    },
  ) {
    const s = this.requireSession(sessionId);
    const { documentPackageHash, byteLength, partCount } = this.computeHash(body);
    return {
      documentPackageHash,
      institutionId: s.institutionId,
      byteLength,
      partCount,
    };
  }

  /**
   * Product path: attach evidence to an existing process.
   * Accepts signature attestation + optional file bytes or precomputed hash.
   */
  @Post('upload')
  async upload(
    @Headers('x-session-id') sessionId: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body()
    body: {
      processId?: string;
      signature?: string;
      fileName?: string;
      contentBase64?: string;
      documentPackageHash?: string;
      hasQualifiedSignature?: boolean;
    },
  ) {
    const s = this.requireSession(sessionId);
    if (!body.processId?.trim()) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'processId required' },
        400,
      );
    }
    if (!body.signature?.trim()) {
      return {
        documentId: null,
        processId: body.processId,
        status: 'rejected' as const,
        rejectionReason: 'signature required (КЭП attestation)',
      };
    }

    let documentPackageHash = body.documentPackageHash?.trim().toLowerCase();
    if (!documentPackageHash && body.contentBase64) {
      const buf = Buffer.from(body.contentBase64, 'base64');
      documentPackageHash = createHash('sha256').update(buf).digest('hex');
    }
    if (!documentPackageHash || !/^[a-f0-9]{64}$/i.test(documentPackageHash)) {
      return {
        documentId: null,
        processId: body.processId,
        status: 'rejected' as const,
        rejectionReason: 'documentPackageHash or contentBase64 required (64 hex hash)',
      };
    }

    const attach = await this.processes.attachDocuments(
      body.processId.trim(),
      {
        documentPackageHash,
        hasQualifiedSignature: body.hasQualifiedSignature !== false,
      },
      s.institutionId,
      idempotencyKey ?? `doc-upload-${randomBytes(8).toString('hex')}`,
    );
    if (attach.statusCode >= 400) {
      if ((attach.body as { code?: string }).code === 'NOT_FOUND') {
        throw new HttpException(attach.body, 404);
      }
      throw new HttpException(attach.body, attach.statusCode);
    }

    const documentId = createHash('sha256')
      .update(`${body.processId}:${documentPackageHash}:${body.signature.slice(0, 32)}`)
      .digest('hex')
      .slice(0, 32);

    return {
      documentId,
      processId: body.processId,
      documentPackageHash,
      status: 'accepted' as const,
      rejectionReason: null,
    };
  }

  private requireSession(sessionId: string | undefined) {
    const s = this.auth.resolve(sessionId);
    if (!s) {
      throw new HttpException(
        { code: 'AUTH_SESSION', message: 'login required' },
        401,
      );
    }
    return s;
  }

  private computeHash(body: {
    parts?: Array<{ name: string; content: string; encoding?: 'utf8' | 'base64' }>;
    rawPackage?: string;
  }) {
    let material = body.rawPackage ?? '';
    if (body.parts?.length) {
      material = body.parts
        .map((p) => {
          const enc = p.encoding ?? 'utf8';
          const payload =
            enc === 'base64'
              ? Buffer.from(p.content, 'base64').toString('utf8')
              : p.content;
          return `${p.name}\n${payload}`;
        })
        .join('\n---\n');
    }
    if (!material.trim()) {
      throw new HttpException(
        { code: 'EMPTY_PACKAGE', message: 'document package empty' },
        422,
      );
    }
    const documentPackageHash = createHash('sha256')
      .update(material, 'utf8')
      .digest('hex');
    return {
      documentPackageHash,
      byteLength: Buffer.byteLength(material, 'utf8'),
      partCount: body.parts?.length ?? (body.rawPackage ? 1 : 0),
    };
  }
}

