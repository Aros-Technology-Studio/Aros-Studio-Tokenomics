import { Injectable } from '@nestjs/common';
import { contentHash } from '../common/crypto/hash';
import { NodechainService } from '../nodechain/nodechain.service';

/**
 * Process state snapshots inside NodeChain (same SoT — state-recording pack).
 */
@Injectable()
export class StateRecordingService {
  private sequences = new Map<string, number>();

  constructor(private readonly nodechain: NodechainService) {}

  /**
   * Write-ahead state record before side-effect ack.
   */
  record(input: {
    processId: string;
    stateType: string;
    payload: unknown;
    validatorId?: string;
    status: string;
  }): { height: number; sequenceId: number; payloadHash: string } {
    const sequenceId = (this.sequences.get(input.processId) ?? 0) + 1;
    this.sequences.set(input.processId, sequenceId);
    const payloadHash = contentHash(input.payload);
    const prevStateHash =
      sequenceId === 1
        ? contentHash('STATE_GENESIS')
        : contentHash({ processId: input.processId, sequenceId: sequenceId - 1 });

    const receipt = this.nodechain.append({
      writerRole: 'internal_service',
      processId: input.processId,
      recordType: 'state_record',
      payload: {
        processId: input.processId,
        sequenceId,
        timestamp: new Date().toISOString(),
        stateType: input.stateType,
        payloadHash,
        prevStateHash,
        validatorId: input.validatorId ?? 'system',
        status: input.status,
        body: input.payload,
      },
    });

    return {
      height: receipt.height,
      sequenceId,
      payloadHash,
    };
  }
}
