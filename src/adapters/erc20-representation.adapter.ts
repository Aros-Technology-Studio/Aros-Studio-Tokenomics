/**
 * Representation Adapter — ERC-20 view only (Core Canon §VI).
 * Canonical state remains NodeChain + PoT. This is NOT source of truth.
 */
export interface Erc20View {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balanceOf: (address: string) => string;
}

export class Erc20RepresentationAdapter implements Erc20View {
  readonly name = 'ArosCoin Representation';
  readonly symbol = 'ARO';
  readonly decimals = 9;

  constructor(
    private readonly getBalance: (holderId: string) => string,
    private readonly getTotalSupply: () => string,
  ) {}

  get totalSupply(): string {
    return this.getTotalSupply();
  }

  balanceOf(address: string): string {
    return this.getBalance(address);
  }

  /** Explicit: no mint/burn here — canonical layer only. */
  transfer(): never {
    throw new Error(
      'ERC-20 adapter does not move canonical balances; use AST Token Protocol',
    );
  }
}
