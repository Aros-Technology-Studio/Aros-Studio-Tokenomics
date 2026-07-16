import { Injectable } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { AppendInput, ExecutionRecord } from './ledger.types';
import { MemoryLedgerStore } from './memory-ledger.store';

@Injectable()
export class NodechainService {
  constructor(private readonly store: MemoryLedgerStore) {}

  /**
   * Append-only, immediately immutable.
   * Only internal_service or quorum_validator may append (nodechain pack).
   */
  append(input: AppendInput): ExecutionRecord {
    if (
      input.writerRole !== 'internal_service' &&
      input.writerRole !== 'quorum_validator'
    ) {
      throw new AstError(
        AstErrorCode.NODECHAIN_APPEND_UNAUTHORIZED,
        'append unauthorized',
      );
    }

    return this.store.append({
      processId: input.processId,
      recordType: input.recordType,
      payload: input.payload,
      createdAt: new Date().toISOString(),
    });
  }

  getHeight(): number {
    return this.store.height;
  }

  listOwnProcess(processId: string): ExecutionRecord[] {
    return this.store.listByProcessId(processId);
  }
}
