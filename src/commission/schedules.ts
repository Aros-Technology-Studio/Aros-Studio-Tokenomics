/**
 * Fee schedules (P0–P4: multi-schedule, sandbox example 0.15%).
 * Rates are absolute fractions of valuation (e.g. 0.0015 = 0.15%).
 */

export interface FeeSchedule {
  id: string;
  name: string;
  feeRate: number;
  /** Nodes share of fee [0,1]; AST share = 1 - nodesShare. Ship default 0.70. */
  nodesShare: number;
  active: boolean;
}

export const SHIP_NODES_SHARE = 0.7;
export const SHIP_AST_SHARE = 0.3;
export const SANDBOX_FEE_RATE = 0.0015;

const DEFAULT_SCHEDULES: FeeSchedule[] = [
  {
    id: 'default',
    name: 'Ship default',
    feeRate: SANDBOX_FEE_RATE,
    nodesShare: SHIP_NODES_SHARE,
    active: true,
  },
  {
    id: 'sandbox',
    name: 'Sandbox 0.15%',
    feeRate: 0.0015,
    nodesShare: SHIP_NODES_SHARE,
    active: true,
  },
  {
    id: 'tier_standard',
    name: 'Standard institutional',
    feeRate: 0.002,
    nodesShare: SHIP_NODES_SHARE,
    active: true,
  },
  {
    id: 'tier_priority',
    name: 'Priority (higher fee)',
    feeRate: 0.003,
    nodesShare: SHIP_NODES_SHARE,
    active: true,
  },
];

export class FeeScheduleRegistry {
  private schedules = new Map<string, FeeSchedule>();

  constructor(seed: FeeSchedule[] = DEFAULT_SCHEDULES) {
    for (const s of seed) this.schedules.set(s.id, { ...s });
  }

  get(id: string): FeeSchedule {
    const s = this.schedules.get(id);
    if (!s || !s.active) {
      throw new Error(`unknown or inactive fee schedule: ${id}`);
    }
    return s;
  }

  list(): FeeSchedule[] {
    return [...this.schedules.values()];
  }

  register(schedule: FeeSchedule): void {
    if (schedule.feeRate < 0 || schedule.feeRate > 1) {
      throw new Error('feeRate must be in [0,1]');
    }
    if (schedule.nodesShare < 0 || schedule.nodesShare > 1) {
      throw new Error('nodesShare must be in [0,1]');
    }
    this.schedules.set(schedule.id, schedule);
  }
}

export function splitFee(
  feeArx: bigint,
  nodesShare: number,
): { nodesPool: bigint; astShare: bigint } {
  const bps = BigInt(Math.round(nodesShare * 10_000));
  const nodesPool = (feeArx * bps) / 10_000n;
  const astShare = feeArx - nodesPool;
  return { nodesPool, astShare };
}
