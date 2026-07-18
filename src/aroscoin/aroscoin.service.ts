import { NodechainService } from '../nodechain/nodechain.service';
import { TokenService } from '../token/token.service';
import type {
  BurnResult,
  MintResult,
  RevaluationResult,
  TokenSnapshot,
  TransferResult,
} from '../token/types';
import { ARO_DECIMALS, ARO_SYMBOL } from '../token/types';

/**
 * ArosCoin (ARO) — canonical token surface over TokenService.
 * Mint/burn/transfer only after PoT (enforced in TokenService + invariants).
 * No privileged free mint.
 */
export class ArosCoinService {
  readonly token: TokenService;

  constructor(nodechain: NodechainService, token?: TokenService) {
    this.token = token ?? new TokenService(nodechain);
  }

  symbol(): string {
    return ARO_SYMBOL;
  }

  decimals(): number {
    return ARO_DECIMALS;
  }

  balanceOf(holderId: string): string {
    return this.token.balanceOf(holderId);
  }

  totalSupply(): string {
    return this.token.totalSupply();
  }

  snapshot(): TokenSnapshot {
    return this.token.snapshot();
  }

  hydrateFromJournal() {
    return this.token.hydrateFromJournal();
  }

  /** PoT-gated mint (journal ok-to-emit required). */
  mintAfterPot(input: {
    processId: string;
    holderId: string;
    amount: string;
    potVerified: 0 | 1;
    potLedgerHeight: number;
    claimId?: string;
  }): Promise<MintResult> {
    return this.token.mintAfterPot(input);
  }

  /** Process-bound burn. */
  burn(input: {
    processId: string;
    holderId: string;
    amount: string;
    claimId?: string;
  }): Promise<BurnResult> {
    return this.token.burn(input);
  }

  /** Remint remainder after partial-release burn (same process, PoT-gated). */
  remintAfterPartialRelease(input: {
    processId: string;
    holderId: string;
    amount: string;
    potLedgerHeight: number;
    claimId?: string;
  }): Promise<MintResult> {
    return this.token.remintAfterPartialRelease(input);
  }

  transferAfterPot(input: {
    processId: string;
    fromHolderId: string;
    toHolderId: string;
    amount: string;
    potVerified: 0 | 1;
    potLedgerHeight: number;
    claimId?: string;
  }): Promise<TransferResult> {
    return this.token.transferAfterPot(input);
  }

  /** ΔValue revaluation → pro-rata supply (I9). */
  revalueAfterPot(input: {
    processId: string;
    previousValue: string;
    newValue: string;
    potVerified: 0 | 1;
    potLedgerHeight: number;
  }): Promise<RevaluationResult> {
    return this.token.revalueAfterPot(input);
  }
}
