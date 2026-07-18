export { ProcessService } from './process.service';
export { ProcessError, ProcessErrorCode } from './errors';
export {
  canTransition,
  assertTransition,
  isTerminal,
  allowedNext,
  listFsmEdges,
  isProcessStage,
  STAGE_ORDER,
} from './stages';
export {
  TERMINAL_STAGES,
  OPEN_COMPLETED_STAGES,
  type ProcessStage,
  type ProcessState,
  type ProcessAdmissibilityFlags,
  type OpenProcessInput,
  type StageTransitionEvent,
} from './types';
