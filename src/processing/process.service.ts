import { NodechainService } from '../nodechain/nodechain.service';
import { EncodingService } from '../tx-encoding/encoding.service';
import type { ProcessTxBody } from '../tx-encoding/types';

export type ProcessStage =
  | 'opened'
  | 'documents'
  | 'encoded'
  | 'awaiting_pot'
  | 'pot_done'
  | 'settled'
  | 'closed'
  | 'aborted';

export interface ProcessState {
  processId: string;
  processType: string;
  institutionId: string;
  stage: ProcessStage;
  stagesCompleted: ProcessStage[];
  payloadHash?: string;
  encoded?: string;
  valuation?: string;
  holderId?: string;
  body?: ProcessTxBody;
}

/**
 * Layer 03 — process lifecycle; uses layer 02 encoding before journal write.
 */
export class ProcessService {
  private readonly processes = new Map<string, ProcessState>();
  private readonly encoding: EncodingService;

  constructor(
    private readonly nodechain: NodechainService,
    encoding?: EncodingService,
  ) {
    this.encoding = encoding ?? new EncodingService();
  }

  get(processId: string): ProcessState | undefined {
    return this.processes.get(processId);
  }

  async open(input: {
    processId: string;
    processType: string;
    institutionId: string;
    /** Full body for encoding (preferred). */
    body?: ProcessTxBody;
    /** Primary-tokenization convenience fields. */
    valuation?: string;
    holderId?: string;
    institutionAllowlisted: boolean;
    hasDocuments: boolean;
    hasQualifiedSignature: boolean;
  }): Promise<ProcessState> {
    if (this.processes.has(input.processId)) {
      throw new Error(`process exists: ${input.processId}`);
    }

    const body: ProcessTxBody = input.body ?? {
      institutionId: input.institutionId,
      valuation: input.valuation,
      holderId: input.holderId,
    };
    if (!body.institutionId) {
      body.institutionId = input.institutionId;
    }

    const encoded = this.encoding.encode({
      processId: input.processId,
      processType: input.processType,
      body,
    });

    await this.nodechain.append({
      clientRecordId: `process-open:${input.processId}`,
      recordType: 'process_open',
      processId: input.processId,
      payload: {
        processType: input.processType,
        institutionId: input.institutionId,
        valuation: input.valuation ?? body.valuation ?? body.newValue ?? body.amount,
        holderId: input.holderId ?? body.holderId ?? body.toHolderId,
        body: encoded.body,
        payloadHash: encoded.payloadHash,
        encoded: encoded.encoded,
        schemaVersion: encoded.schemaVersion,
        institutionAllowlisted: input.institutionAllowlisted,
        hasDocuments: input.hasDocuments,
        hasQualifiedSignature: input.hasQualifiedSignature,
      },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });

    const state: ProcessState = {
      processId: input.processId,
      processType: input.processType,
      institutionId: input.institutionId,
      stage: 'awaiting_pot',
      stagesCompleted: ['opened', 'documents', 'encoded'],
      payloadHash: encoded.payloadHash,
      encoded: encoded.encoded,
      valuation: input.valuation ?? body.valuation ?? body.newValue ?? body.amount,
      holderId: input.holderId ?? body.holderId ?? body.toHolderId,
      body: encoded.body,
    };
    this.processes.set(input.processId, state);

    await this.nodechain.append({
      clientRecordId: `process-stage-encoded:${input.processId}`,
      recordType: 'process_stage',
      processId: input.processId,
      payload: { stage: 'encoded', payloadHash: encoded.payloadHash },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });

    return state;
  }

  async markPotDone(processId: string): Promise<void> {
    const p = this.require(processId);
    p.stage = 'pot_done';
    p.stagesCompleted.push('pot_done');
    await this.nodechain.append({
      clientRecordId: `process-stage-pot:${processId}`,
      recordType: 'process_stage',
      processId,
      payload: { stage: 'pot_done' },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
  }

  async close(processId: string): Promise<void> {
    const p = this.require(processId);
    p.stage = 'closed';
    p.stagesCompleted.push('closed');
    await this.nodechain.append({
      clientRecordId: `process-close:${processId}`,
      recordType: 'process_close',
      processId,
      payload: { stage: 'closed' },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
  }

  private require(processId: string): ProcessState {
    const p = this.processes.get(processId);
    if (!p) throw new Error(`unknown process ${processId}`);
    return p;
  }
}
