/**
 * Formal L3 LLM adapters (issue #70).
 * Five agent roles map 1:1 to policy agents; LLM is optional upgrade.
 * Fail-closed: invalid JSON / HTTP errors → pass=false.
 * Tests keep PolicyAgent backend unless AST_L3_USE_LLM=1.
 */
import {
  L3AgentRegistry,
  HttpL3Agent,
  type AgentId,
  type AgentOpinion,
  type L3Agent,
  type L3Context,
} from './l3-agents';

export type LlmProviderId = 'openai_compatible' | 'mock' | 'http';

export interface LlmCompletionRequest {
  agentId: string;
  system: string;
  user: string;
  /** JSON schema hint for structured output */
  responseFormat: 'agent_opinion_v1';
}

export interface LlmProvider {
  readonly id: LlmProviderId | string;
  complete(req: LlmCompletionRequest): Promise<{
    score: number;
    pass: boolean;
    reasons: string[];
    raw?: string;
  }>;
}

/** Deterministic mock for CI — mirrors policy-ish rules without network. */
export class MockLlmProvider implements LlmProvider {
  readonly id = 'mock' as const;

  async complete(req: LlmCompletionRequest) {
    const ctx = JSON.parse(req.user) as L3Context;
    let score = 0.9;
    let pass = true;
    const reasons: string[] = [`mock:${req.agentId}`];
    if (ctx.potVerified !== 1 && req.agentId.includes('pot')) {
      pass = false;
      score = 0;
      reasons.push('pot not verified');
    }
    if (!ctx.institutionAllowlisted && req.agentId.includes('intake')) {
      pass = false;
      score = 0;
      reasons.push('institution not allowlisted');
    }
    if (ctx.allSeeingEyeCriticalCount > 0 && req.agentId.includes('anomaly')) {
      pass = false;
      score = 0.2;
      reasons.push('critical signals');
    }
    return { score, pass, reasons };
  }
}

/**
 * OpenAI-compatible chat completions (OpenAI, local vLLM, SpaceXAI-compatible, etc.).
 * Env: AST_L3_LLM_BASE_URL, AST_L3_LLM_API_KEY, AST_L3_LLM_MODEL
 */
export class OpenAiCompatibleProvider implements LlmProvider {
  readonly id = 'openai_compatible' as const;

  constructor(
    private readonly baseUrl = process.env.AST_L3_LLM_BASE_URL ?? 'https://api.openai.com/v1',
    private readonly apiKey = process.env.AST_L3_LLM_API_KEY ?? '',
    private readonly model = process.env.AST_L3_LLM_MODEL ?? 'gpt-4o-mini',
    private readonly timeoutMs = 20_000,
  ) {}

  async complete(req: LlmCompletionRequest) {
    if (!this.apiKey && !this.baseUrl.includes('localhost')) {
      return {
        score: 0,
        pass: false,
        reasons: ['AST_L3_LLM_API_KEY missing'],
      };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: req.system },
            { role: 'user', content: req.user },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        return {
          score: 0,
          pass: false,
          reasons: [`llm http ${res.status}`],
        };
      }
      const body = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = body.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content) as {
        score?: number;
        pass?: boolean;
        reasons?: string[];
      };
      return {
        score: typeof parsed.score === 'number' ? Math.min(1, Math.max(0, parsed.score)) : 0,
        pass: parsed.pass === true,
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : ['no reasons'],
        raw: content,
      };
    } catch (e) {
      return {
        score: 0,
        pass: false,
        reasons: [`llm error: ${String(e)}`],
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

const ROLE_PROMPTS: Record<string, string> = {
  intake_integrity:
    'You are AST L3 intake_integrity. Check institution allowlist context. Reply JSON {score:0-1, pass:boolean, reasons:string[]}.',
  pot_consistency:
    'You are AST L3 pot_consistency. Require potVerified=1 and encoded stage. Reply JSON {score, pass, reasons}.',
  economic_bounds:
    'You are AST L3 economic_bounds. Validate valuation bounds and high-value scrutiny. Reply JSON {score, pass, reasons}.',
  anomaly_watch:
    'You are AST L3 anomaly_watch. Fail if allSeeingEyeCriticalCount>0. Reply JSON {score, pass, reasons}.',
  release_risk:
    'You are AST L3 release_risk. Assess emission release risk after PoT. Reply JSON {score, pass, reasons}.',
};

export class LlmL3Agent implements L3Agent {
  constructor(
    public readonly id: AgentId | string,
    private readonly provider: LlmProvider,
  ) {}

  async evaluate(ctx: L3Context): Promise<AgentOpinion> {
    const system =
      ROLE_PROMPTS[this.id] ??
      `You are AST L3 agent ${this.id}. Reply JSON {score:0-1, pass:boolean, reasons:string[]}.`;
    const out = await this.provider.complete({
      agentId: String(this.id),
      system,
      user: JSON.stringify(ctx),
      responseFormat: 'agent_opinion_v1',
    });
    return {
      agentId: this.id,
      score: out.score,
      pass: out.pass,
      reasons: out.reasons,
      backend: 'llm',
    };
  }
}

const AGENT_IDS: AgentId[] = [
  'intake_integrity',
  'pot_consistency',
  'economic_bounds',
  'anomaly_watch',
  'release_risk',
];

export function defaultLlmProviderFromEnv(): LlmProvider {
  const kind = (process.env.AST_L3_LLM_PROVIDER ?? 'mock').toLowerCase();
  if (kind === 'openai' || kind === 'openai_compatible') {
    return new OpenAiCompatibleProvider();
  }
  return new MockLlmProvider();
}

/** Full five-agent LLM panel (or mock) for AST_L3_USE_LLM=1. */
export function buildLlmPanelFromEnv(
  provider: LlmProvider = defaultLlmProviderFromEnv(),
): L3AgentRegistry {
  const reg = new L3AgentRegistry();
  for (const id of AGENT_IDS) {
    const url = process.env[`AST_L3_HTTP_${id.toUpperCase()}`];
    if (url) {
      reg.register(new HttpL3Agent(id, url));
    } else {
      reg.register(new LlmL3Agent(id, provider));
    }
  }
  return reg;
}
