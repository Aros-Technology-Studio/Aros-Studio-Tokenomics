import type { NodechainService } from '../nodechain/nodechain.service';

export interface AssetRecord {
  assetId: string;
  institutionId: string;
  processIdPrimary: string;
  currentValue: string;
  holderIds: string[];
  status: 'active' | 'transferred' | 'closed';
  createdAtUtc: string;
  updatedAtUtc: string;
}

/**
 * Working projection of tokenized assets from journal.
 * SoT remains NodeChain records (process + mint + reval + transfer facts).
 */
export class AssetRegistry {
  private assets = new Map<string, AssetRecord>();

  constructor(private readonly nodechain: NodechainService) {}

  get(assetId: string): AssetRecord | undefined {
    return this.assets.get(assetId);
  }

  list(): AssetRecord[] {
    return [...this.assets.values()].sort((a, b) => a.assetId.localeCompare(b.assetId));
  }

  registerPrimary(input: {
    assetId: string;
    institutionId: string;
    processId: string;
    valuation: string;
    holderId: string;
  }): AssetRecord {
    if (this.assets.has(input.assetId)) {
      throw new Error(`asset already registered: ${input.assetId}`);
    }
    const now = new Date().toISOString();
    const row: AssetRecord = {
      assetId: input.assetId,
      institutionId: input.institutionId,
      processIdPrimary: input.processId,
      currentValue: input.valuation,
      holderIds: [input.holderId],
      status: 'active',
      createdAtUtc: now,
      updatedAtUtc: now,
    };
    this.assets.set(input.assetId, row);
    return row;
  }

  applyRevaluation(assetId: string, newValue: string): AssetRecord {
    const a = this.require(assetId);
    a.currentValue = newValue;
    a.updatedAtUtc = new Date().toISOString();
    return a;
  }

  applyTransfer(assetId: string, fromHolderId: string, toHolderId: string): AssetRecord {
    const a = this.require(assetId);
    a.holderIds = a.holderIds.filter((h) => h !== fromHolderId);
    if (!a.holderIds.includes(toHolderId)) a.holderIds.push(toHolderId);
    a.updatedAtUtc = new Date().toISOString();
    return a;
  }

  async journalRegister(input: {
    assetId: string;
    institutionId: string;
    processId: string;
    valuation: string;
    holderId: string;
    documentPackageHash?: string;
  }): Promise<void> {
    this.registerPrimary(input);
    await this.nodechain.append({
      clientRecordId: `asset-register:${input.assetId}`,
      recordType: 'param_change',
      processId: input.processId,
      payload: {
        kind: 'asset_registered',
        assetId: input.assetId,
        institutionId: input.institutionId,
        valuation: input.valuation,
        holderId: input.holderId,
        documentPackageHash: input.documentPackageHash ?? null,
      },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
  }

  private require(assetId: string): AssetRecord {
    const a = this.assets.get(assetId);
    if (!a) throw new Error(`unknown asset ${assetId}`);
    return a;
  }
}
