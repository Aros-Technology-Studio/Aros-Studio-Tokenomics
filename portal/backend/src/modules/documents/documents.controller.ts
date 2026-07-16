import { Body, Controller, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';

class UploadBodyDto {
  @IsString()
  @MinLength(1)
  processId!: string;

  /** Base64 qualified electronic signature — mandatory. */
  @IsString()
  @MinLength(1)
  signature!: string;

  /** Optional: file handled when multipart middleware is wired. */
  @IsString()
  @MinLength(0)
  fileName?: string;
}

/**
 * Document upload with mandatory signature.
 * Multipart file handling is added when multer is fully wired; signature is required now.
 */
@Controller('documents')
export class DocumentsController {
  @Post('upload')
  upload(@Body() body: UploadBodyDto): {
    documentId: string;
    processId: string;
    status: 'accepted' | 'rejected';
    rejectionReason: string | null;
    note: string;
  } {
    if (!body.signature?.length) {
      return {
        documentId: '',
        processId: body.processId,
        status: 'rejected',
        rejectionReason: 'qualified_signature_required',
        note: 'Qualified e-signature is mandatory',
      };
    }

    return {
      documentId: `doc-stub-${Date.now()}`,
      processId: body.processId,
      status: 'accepted',
      rejectionReason: null,
      note: 'Stub — verify signature and forward to Orchestrator document validation step',
    };
  }
}
