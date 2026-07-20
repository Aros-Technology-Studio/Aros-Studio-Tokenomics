import { Inject, Injectable } from '@nestjs/common';
import { ProcessesService } from '../processes/processes.service';

/**
 * Asset claims view for the institutional portal.
 * Read-only projection of edge-tracked processes (not a wallet / not SoT).
 */
@Injectable()
export class AssetsService {
  constructor(
    @Inject(ProcessesService) private readonly processes: ProcessesService,
  ) {}

  listClaims(institutionId: string) {
    const rows = this.processes.listForInstitution(institutionId);
    return rows.map((r) => ({
      claimId: r.processId,
      processId: r.processId,
      status: r.status,
      processType: r.processType,
      valuation: r.valuation,
      holderId: r.holderId,
      assetId: r.assetId,
      documentPackageHash: r.documentPackageHash,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  getClaim(institutionId: string, claimId: string) {
    const rows = this.processes.listForInstitution(institutionId);
    return rows.find((r) => r.processId === claimId) ?? null;
  }
}
