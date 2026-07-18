/**
 * L2/L3 AI governance hierarchy — advisory + gates, no token voting, no mint authority.
 *
 * Five agent roles (product vision) as structured evaluators:
 * 1. intake_integrity
 * 2. pot_consistency
 * 3. economic_bounds
 * 4. anomaly_watch
 * 5. release_risk
 *
 * L2: committee multi-step approval (role-based humans/services)
 * L3: AI agent panel scores; hard fail if critical agent rejects; else advisory
 */

export type AgentId =
  | 'intake_integrity'
  | 'pot_consistency'
  | 'economic_bounds'
  | 'anomaly_watch'
  | 'release_risk';

export interface AgentOpinion {
  agentId: AgentId;
  score: number; // 0..1
  pass: boolean;
  reasons: string[];
}

export interface L3Context {
  processId: string;
  valuation: string;
  potVerified: 0 | 1;
  institutionAllowlisted: boolean;
  stagesCompleted: string[];
  eyeCriticalCount: number;
  highValue: boolean;
}

export interface L3Result {
  pass: boolean;
  opinions: AgentOpinion[];
  aggregateScore: number;
  reasonCodes: string[];
}

const AGENTS: AgentId[] = [
  'intake_integrity',
  'pot_consistency',
  'economic_bounds',
  'anomaly_watch',
  'release_risk',
];

function parseVal(v: string): number {
  return Number(v);
}

/** Deterministic rule-based stand-ins for AI agents (same interface as future LLM/agents). */
export function runAgentPanel(ctx: L3Context): L3Result {
  const opinions: AgentOpinion[] = AGENTS.map((agentId) => evaluateAgent(agentId, ctx));
  const reasonCodes: string[] = [];
  for (const o of opinions) {
    if (!o.pass) reasonCodes.push(`L3_${o.agentId.toUpperCase()}_FAIL`);
  }
  const aggregateScore =
    opinions.reduce((s, o) => s + o.score, 0) / Math.max(1, opinions.length);
  // Fail closed if any critical agent fails, or aggregate < 0.6 on high value
  const anyFail = opinions.some((o) => !o.pass);
  const highValueWeak = ctx.highValue && aggregateScore < 0.6;
  if (highValueWeak) reasonCodes.push('L3_HIGH_VALUE_WEAK_SCORE');
  return {
    pass: !anyFail && !highValueWeak,
    opinions,
    aggregateScore,
    reasonCodes,
  };
}

function evaluateAgent(agentId: AgentId, ctx: L3Context): AgentOpinion {
  const reasons: string[] = [];
  let score = 1;
  let pass = true;

  switch (agentId) {
    case 'intake_integrity':
      if (!ctx.institutionAllowlisted) {
        pass = false;
        score = 0;
        reasons.push('institution not allowlisted');
      }
      break;
    case 'pot_consistency':
      if (ctx.potVerified !== 1) {
        pass = false;
        score = 0;
        reasons.push('pot not verified');
      }
      if (!ctx.stagesCompleted.includes('encoded')) {
        score *= 0.5;
        reasons.push('encoded stage missing');
      }
      break;
    case 'economic_bounds': {
      const v = parseVal(ctx.valuation);
      if (!(v > 0) || !Number.isFinite(v)) {
        pass = false;
        score = 0;
        reasons.push('invalid valuation');
      } else if (v > 1e12) {
        pass = false;
        score = 0.1;
        reasons.push('valuation above absolute ceiling');
      } else if (ctx.highValue) {
        score = 0.75;
        reasons.push('high value — elevated scrutiny');
      }
      break;
    }
    case 'anomaly_watch':
      if (ctx.eyeCriticalCount > 0) {
        pass = false;
        score = 0.2;
        reasons.push('critical eye events present');
      }
      break;
    case 'release_risk':
      // Primary tokenization: release risk low if pot ok
      if (ctx.potVerified === 1) {
        score = 0.9;
      } else {
        pass = false;
        score = 0;
        reasons.push('cannot assess release without pot');
      }
      break;
  }

  return { agentId, score, pass, reasons };
}
