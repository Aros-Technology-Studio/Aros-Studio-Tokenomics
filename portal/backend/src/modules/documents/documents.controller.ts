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
import { extractFromBuffer } from './document-extract';
import { requireX509, verifyX509Detached } from './x509-verify';

/**
 * Document package at the edge (SHA-256 + signature attestation / X.509 D4).
 * Does not store PII documents as NodeChain SoT.
 */
@Controller('v1/documents')
export class DocumentsController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ProcessesService) private readonly processes: ProcessesService,
  ) {}

  /**
   * Assist: extract text-ish signals from package (amounts, labels).
   * Human must still confirm — not OCR for image-only scans.
   */
  @Post('extract')
  extract(
    @Headers('x-session-id') sessionId: string | undefined,
    @Body()
    body: {
      fileName?: string;
      contentBase64?: string;
      parts?: Array<{ name: string; content: string; encoding?: 'utf8' | 'base64' }>;
    },
  ) {
    this.requireSession(sessionId);
    let buf: Buffer | null = null;
    let fileName = body.fileName ?? 'package.bin';
    if (body.contentBase64?.trim()) {
      buf = Buffer.from(body.contentBase64, 'base64');
    } else if (body.parts?.length) {
      // Prefer first PDF part for assist
      const pdf =
        body.parts.find((p) => p.name.toLowerCase().endsWith('.pdf')) ?? body.parts[0];
      fileName = pdf.name;
      buf =
        (pdf.encoding ?? 'utf8') === 'base64'
          ? Buffer.from(pdf.content, 'base64')
          : Buffer.from(pdf.content, 'utf8');
    }
    if (!buf || buf.length === 0) {
      throw new HttpException(
        { code: 'EMPTY_PACKAGE', message: 'contentBase64 or parts required' },
        422,
      );
    }
    if (buf.length > 25 * 1024 * 1024) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'file too large for extract assist (25MB)' },
        422,
      );
    }
    const hints = extractFromBuffer(buf, fileName);
    return {
      ok: true,
      fileName,
      byteLength: buf.length,
      assist: true,
      ...hints,
      disclaimer:
        'Assist only. Values must match the verified signed document. AST does not appraise.',
    };
  }

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
   * Confirm electronic signature before tokenization starts.
   * - institutional_attestation (v1): flag + attestation text
   * - x509_detached (D4): PEM leaf + chain + detached sig over package hash
   * Fail-closed. AST_REQUIRE_X509=1 forces x509_detached.
   */
  @Post('verify-signature')
  verifySignature(
    @Headers('x-session-id') sessionId: string | undefined,
    @Body()
    body: {
      documentPackageHash?: string;
      fileName?: string;
      hasQualifiedSignature?: boolean;
      /** Free-form attestation (КЭП id / seal reference / base64 fragment). */
      signatureAttestation?: string;
      signerId?: string;
      /** institutional_attestation | x509_detached */
      mode?: string;
      signerCertificatePem?: string;
      signatureBase64?: string;
      certificateChainPem?: string | string[];
    },
  ) {
    const s = this.requireSession(sessionId);
    const hash = body.documentPackageHash?.trim().toLowerCase() ?? '';
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      throw new HttpException(
        {
          code: 'MISSING_DOCUMENTS',
          message: 'documentPackageHash required (64 hex SHA-256)',
        },
        422,
      );
    }
    if (body.hasQualifiedSignature !== true) {
      throw new HttpException(
        {
          code: 'MISSING_QUALIFIED_SIGNATURE',
          message: 'hasQualifiedSignature must be true — electronic signature required',
        },
        422,
      );
    }

    const modeRaw = (body.mode ?? 'institutional_attestation').trim().toLowerCase();
    const mode =
      modeRaw === 'x509' || modeRaw === 'x509_detached' || modeRaw === 'qes_x509'
        ? 'x509_detached'
        : 'institutional_attestation';

    if (requireX509() && mode !== 'x509_detached') {
      throw new HttpException(
        {
          code: 'X509_REQUIRED',
          message:
            'AST_REQUIRE_X509=1 — use mode x509_detached with signerCertificatePem + signatureBase64',
        },
        422,
      );
    }

    if (mode === 'x509_detached') {
      const r = verifyX509Detached({
        documentPackageHash: hash,
        signerCertificatePem: body.signerCertificatePem ?? '',
        signatureBase64: body.signatureBase64 ?? '',
        certificateChainPem: body.certificateChainPem,
        institutionId: s.institutionId,
      });
      if (!r.ok) {
        throw new HttpException({ code: r.code, message: r.message }, 422);
      }
      const verificationId = createHash('sha256')
        .update(`${s.institutionId}:${r.verificationMaterial}`)
        .digest('hex')
        .slice(0, 24);
      return {
        ok: true,
        verified: true,
        mode: 'x509_detached',
        verificationId,
        documentPackageHash: hash,
        fileName: body.fileName ?? null,
        signerId: body.signerId?.trim() || r.subject,
        institutionId: s.institutionId,
        verifiedAt: new Date().toISOString(),
        signer: {
          subject: r.subject,
          issuer: r.issuer,
          serialNumber: r.serialNumber,
          fingerprint256: r.fingerprint256,
          notBefore: r.notBefore,
          notAfter: r.notAfter,
        },
        chainDepth: r.chainDepth,
        trustAnchorFingerprint256: r.trustAnchorFingerprint256,
        message:
          'X.509 detached signature verified at portal edge against configured trust anchors. Tokenization may proceed.',
        next: 'POST /v1/tokenization/start or POST /v1/processes',
      };
    }

    const att = body.signatureAttestation?.trim() ?? '';
    if (att.length < 8) {
      throw new HttpException(
        {
          code: 'SIGNATURE_ATTESTATION_REQUIRED',
          message:
            'signatureAttestation required (min 8 chars): QES id, seal reference, or signature material',
        },
        422,
      );
    }

    const verificationId = createHash('sha256')
      .update(`${s.institutionId}:${hash}:${att}:${body.signerId ?? ''}`)
      .digest('hex')
      .slice(0, 24);

    return {
      ok: true,
      verified: true,
      mode: 'institutional_attestation',
      verificationId,
      documentPackageHash: hash,
      fileName: body.fileName ?? null,
      signerId: body.signerId?.trim() || s.institutionId,
      institutionId: s.institutionId,
      verifiedAt: new Date().toISOString(),
      message:
        'Electronic signature attested at portal edge (institutional attestation). For cryptographic X.509 use mode=x509_detached (D4). Tokenization may proceed.',
      next: 'POST /v1/tokenization/start or POST /v1/processes',
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
    if (body.parts?.length) {
      const h = createHash('sha256');
      let byteLength = 0;
      for (const p of body.parts) {
        const nameBuf = Buffer.from(`${p.name}\n`, 'utf8');
        h.update(nameBuf);
        byteLength += nameBuf.length;
        if ((p.encoding ?? 'utf8') === 'base64') {
          const raw = Buffer.from(p.content, 'base64');
          h.update(raw);
          byteLength += raw.length;
        } else {
          const raw = Buffer.from(p.content, 'utf8');
          h.update(raw);
          byteLength += raw.length;
        }
        h.update(Buffer.from('\n---\n', 'utf8'));
      }
      return {
        documentPackageHash: h.digest('hex'),
        byteLength,
        partCount: body.parts.length,
      };
    }
    const material = body.rawPackage ?? '';
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
      partCount: 1,
    };
  }
}

