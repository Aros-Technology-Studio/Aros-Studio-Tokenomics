/**
 * L3 governance agents — real policy evaluators (not placeholders).
 * Each agent is a pure function of recorded process context.
 * Optional HTTP agents can be registered via L3AgentRegistry for remote models.
 */

export type AgentId =
  | 'intake_integrity'
  | 'pot_consistency'
  | 'economic_bounds'
  | 'anomaly_watch'
  | 'release_risk';

export interface AgentOpinion {
  agentId: AgentId | string;
  score: number;
  pass: boolean;
  reasons: string[];
  backend: 'policy' | 'http' | 'llm';
}

export interface L3Context {
  processId: string;
  valuation: string;
  potVerified: 0 | 1;
  institutionAllowlisted: boolean;
  stagesCompleted: string[];
  allSeeingEyeCriticalCount: number;
  highValue: boolean;
}

export interface L3Result {
  pass: boolean;
  opinions: AgentOpinion[];
  aggregateScore: number;
  reasonCodes: string[];
}

export interface L3Agent {
  readonly id: AgentId | string;
  evaluate(ctx: L3Context): Promise<AgentOpinion> | AgentOpinion;
}

const POLICY_AGENT_IDS: AgentId[] = [
  'intake_integrity',
  'pot_consistency',
  'economic_bounds',
  'anomaly_watch',
  'release_risk',
];

function parseVal(v: string): number {
  return Number(v);
}

export class PolicyAgent implements L3Agent {
  constructor(public readonly id: AgentId) {}

  evaluate(ctx: L3Context): AgentOpinion {
    const reasons: string[] = [];
    let score = 1;
    let pass = true;

    switch (this.id) {
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
        if (ctx.allSeeingEyeCriticalCount > 0) {
          pass = false;
          score = 0.2;
          reasons.push('critical All-Seeing Eye events present');
        }
        break;
      case 'release_risk':
        if (ctx.potVerified === 1) {
          score = 0.9;
        } else {
          pass = false;
          score = 0;
          reasons.push('cannot assess release without pot');
        }
        break;
      default:
        pass = false;
        score = 0;
        reasons.push(`unknown agent ${this.id}`);
    }

    return { agentId: this.id, score, pass, reasons, backend: 'policy' };
  }
}

/** Remote agent: POST JSON L3Context to endpoint, expect AgentOpinion JSON. */
export class HttpL3Agent implements L3Agent {
  constructor(
    public readonly id: string,
    private readonly url: string,
    private readonly timeoutMs = 10_000,
  ) {}

  async evaluate(ctx: L3Context): Promise<AgentOpinion> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ agentId: this.id, context: ctx }),
        signal: controller.signal });
      if (!res.ok) {
        return {
          agentId: this.id,
          score: 0,
          pass: false,
          reasons: [`http ${res.status}`],
          backend: 'http' };
      }
      const body = (await res.json()) as Partial<AgentOpinion>;
      return {
        agentId: this.id,
        score: typeof body.score === 'number' ? body.score : 0,
        pass: body.pass === true,
        reasons: Array.isArray(body.reasons) ? body.reasons.map(String) : ['invalid response'],
        backend: 'http' };
    } catch (e) {
      return {
        agentId: this.id,
        score: 0,
        pass: false,
        reasons: [`http error: ${String(e)}`],
        backend: 'http' };
    } finally {
      clearTimeout(timer);
    }
  }
}

export class L3AgentRegistry {
  private agents: L3Agent[] = [];

  static defaultPolicyPanel(): L3AgentRegistry {
    const reg = new L3AgentRegistry();
    for (const id of POLICY_AGENT_IDS) {
      reg.register(new PolicyAgent(id));
    }
    return reg;
  }

  /**
   * Env panel:
   * - default: deterministic PolicyAgent × 5
   * - AST_L3_HTTP_<AGENT_ID>=url → HttpL3Agent
   * - AST_L3_USE_LLM=1 → LlmL3Agent for each role (mock|openai_compatible)
   */
  static fromEnv(): L3AgentRegistry {
    if (process.env.AST_L3_USE_LLM === '1' || process.env.AST_L3_USE_LLM === 'true') {
      // Dynamic import path via function to limit circular init risk
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { buildLlmPanelFromEnv } = require('./llm-adapters');
      return buildLlmPanelFromEnv();
    }
    const reg = L3AgentRegistry.defaultPolicyPanel();
    for (const id of POLICY_AGENT_IDS) {
      const url = process.env[`AST_L3_HTTP_${id.toUpperCase()}`];
      if (url) {
        reg.register(new HttpL3Agent(id, url));
      }
    }
    return reg;
  }

  register(agent: L3Agent): void {
    this.agents = this.agents.filter((a) => a.id !== agent.id);
    this.agents.push(agent);
  }

  list(): L3Agent[] {
    return [...this.agents];
  }

  async runPanel(ctx: L3Context): Promise<L3Result> {
    if (this.agents.length === 0) {
      throw new Error('L3AgentRegistry is empty');
    }
    const opinions: AgentOpinion[] = [];
    for (const agent of this.agents) {
      opinions.push(await Promise.resolve(agent.evaluate(ctx)));
    }
    const reasonCodes: string[] = [];
    for (const o of opinions) {
      if (!o.pass) {
        reasonCodes.push(`L3_${String(o.agentId).toUpperCase()}_FAIL`);
      }
    }
    const aggregateScore =
      opinions.reduce((s, o) => s + o.score, 0) / Math.max(1, opinions.length);
    const anyFail = opinions.some((o) => !o.pass);
    const highValueWeak = ctx.highValue && aggregateScore < 0.6;
    if (highValueWeak) {
      reasonCodes.push('L3_HIGH_VALUE_WEAK_SCORE');
    }
    return {
      pass: !anyFail && !highValueWeak,
      opinions,
      aggregateScore,
      reasonCodes };
  }
}

/** Default panel used by governance when no custom registry is injected. */
export function runAgentPanel(ctx: L3Context): Promise<L3Result> {
  return L3AgentRegistry.defaultPolicyPanel().runPanel(ctx);
}
