import {
  Body,
  Controller,
  Headers,
  HttpException,
  Inject,
  Post,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from '../auth/auth.service';

/**
 * Hash document package content at the edge (SHA-256).
 * Does not store PII documents long-term in v1 — returns hash for process submit.
 */
@Controller('v1/documents')
export class DocumentsController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('hash')
  hash(
    @Headers('x-session-id') sessionId: string | undefined,
    @Body()
    body: {
      /** UTF-8 or base64 document parts */
      parts?: Array<{ name: string; content: string; encoding?: 'utf8' | 'base64' }>;
      /** Or raw pre-concatenated package string */
      rawPackage?: string;
    },
  ) {
    const s = this.auth.resolve(sessionId);
    if (!s) {
      throw new HttpException(
        { code: 'AUTH_SESSION', message: 'login required' },
        401,
      );
    }
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
      institutionId: s.institutionId,
      byteLength: Buffer.byteLength(material, 'utf8'),
      partCount: body.parts?.length ?? (body.rawPackage ? 1 : 0),
    };
  }
}
