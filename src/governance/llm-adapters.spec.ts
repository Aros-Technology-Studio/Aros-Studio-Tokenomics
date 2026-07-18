import { MockLlmProvider, LlmL3Agent, buildLlmPanelFromEnv } from './llm-adapters';
import type { L3Context } from './l3-agents';

const healthy: L3Context = {
  processId: 'AST-DEMO-20260719-l3a1',
  valuation: '100.000000000',
  potVerified: 1,
  institutionAllowlisted: true,
  stagesCompleted: ['opened', 'documents', 'encoded'],
  allSeeingEyeCriticalCount: 0,
  highValue: false,
};

describe('L3 LLM adapters (#70)', () => {
  it('mock provider passes healthy context for pot_consistency', async () => {
    const agent = new LlmL3Agent('pot_consistency', new MockLlmProvider());
    const o = await agent.evaluate(healthy);
    expect(o.backend).toBe('llm');
    expect(o.pass).toBe(true);
  });

  it('mock provider fails pot when unverified', async () => {
    const agent = new LlmL3Agent('pot_consistency', new MockLlmProvider());
    const o = await agent.evaluate({ ...healthy, potVerified: 0 });
    expect(o.pass).toBe(false);
  });

  it('buildLlmPanelFromEnv runs five agents', async () => {
    const prev = process.env.AST_L3_LLM_PROVIDER;
    process.env.AST_L3_LLM_PROVIDER = 'mock';
    const panel = buildLlmPanelFromEnv();
    expect(panel.list()).toHaveLength(5);
    const r = await panel.runPanel(healthy);
    expect(r.pass).toBe(true);
    expect(r.opinions.every((o) => o.backend === 'llm' || o.backend === 'http')).toBe(true);
    if (prev === undefined) delete process.env.AST_L3_LLM_PROVIDER;
    else process.env.AST_L3_LLM_PROVIDER = prev;
  });
});
