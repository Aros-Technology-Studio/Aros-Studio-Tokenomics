#!/usr/bin/env tsx
/**
 * Operator smoke (C5) — single process, in-memory journal.
 * Covers: Orchestrator primary path · Oracle multi-sig · Release gate/daemon · Partial release.
 * Exit 0 only if all steps pass. No fake Done.
 *
 * Usage (from repo root):
 *   npm run smoke:operator
 *   npx tsx scripts/operator-smoke.ts
 */
import { OrchestratorService } from '../src/orchestrator/orchestrator.service';
import { assertInternalCirculation } from '../src/release/release-gate';
import { InvariantError } from '../src/invariants';
import { OracleError } from '../src/oracle-gateway/errors';
import { globalKillSwitch } from '../src/hardening/kill-switch';

type StepResult = { name: string; ok: boolean; detail: string };

function dayStamp(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function pid(tag: string): string {
  const s = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(0, 12);
  return `AST-DEMO-${dayStamp()}-${s}${tag}`.slice(0, 48);
}

async function main(): Promise<void> {
  globalKillSwitch.release();
  const steps: StepResult[] = [];
  const fail = (name: string, detail: string): never => {
    steps.push({ name, ok: false, detail });
    print(steps);
    process.exit(1);
  };
  const pass = (name: string, detail: string) => {
    steps.push({ name, ok: true, detail });
  };

  console.log('AST operator smoke (C5) — memory engine\n');

  const orch = OrchestratorService.createInMemory();
  const release = orch.release;

  // --- 1. Release gate BEFORE primary (daemon not active yet) ---
  try {
    assertInternalCirculation(release, 'holder', 'cex_list');
    fail('release.gate_pre', 'cex_list should be blocked before release phase');
  } catch (e) {
    if (e instanceof InvariantError || /I8|Release|blocked/i.test(String(e))) {
      pass('release.gate_pre', 'external circulation blocked pre-release (I8)');
    } else {
      fail('release.gate_pre', e instanceof Error ? e.message : String(e));
    }
  }

  try {
    assertInternalCirculation(release, 'holder', 'internal_transfer');
    pass('release.gate_internal', 'internal_transfer allowed pre-release');
  } catch (e) {
    fail('release.gate_internal', e instanceof Error ? e.message : String(e));
  }

  // --- 2. Orchestrator primary path ---
  const primaryPid = pid('o');
  let primary: Awaited<ReturnType<typeof orch.runPrimary>>;
  try {
    primary = await orch.runPrimary({
      processId: primaryPid,
      institutionId: 'DEMO',
      valuation: '1000.000000000',
      holderId: 'holder-smoke',
      idempotencyKey: `idem-smoke-primary-${Date.now()}`,
      assetId: `asset-${primaryPid}`,
      feeRate: 0.0015,
      hasDocuments: true,
      hasQualifiedSignature: true,
      institutionAllowlisted: true,
    });
  } catch (e) {
    fail('orchestrator.primary', e instanceof Error ? e.message : String(e));
  }

  if (primary.verdict.verified !== 1 || !primary.okToEmit.okToEmit) {
    fail('orchestrator.primary', 'PoT not verified / ok-to-emit false');
  }
  if (primary.mint.amount !== '1000.000000000') {
    fail('orchestrator.primary', `unexpected mint ${primary.mint.amount}`);
  }
  if (primary.settlement.split.nodes < 0.69 || primary.settlement.split.nodes > 0.71) {
    fail('orchestrator.primary', `commission nodes share ${primary.settlement.split.nodes}`);
  }
  if (!primary.chain.ok) {
    fail('orchestrator.primary', 'chain not ok after primary');
  }
  pass(
    'orchestrator.primary',
    `processId=${primary.processId} mint=${primary.mint.amount} fee=${primary.settlement.fee} reserveIndex=${primary.reserveIndex}`,
  );

  // Primary path may activate release (tick inside orchestrator) — record status
  try {
    const st = await release.status();
    pass(
      'release.status_post_primary',
      `active=${st.active} reserveIndex=${st.reserveIndex} velocity=${st.velocity}`,
    );
  } catch (e) {
    fail('release.status_post_primary', e instanceof Error ? e.message : String(e));
  }

  // --- 3. Oracle multi-oracle fail-closed ---
  const oracle = orch.oracle;
  const asOfUtc = new Date().toISOString();
  const oraclePid = primary.processId;
  try {
    const a = oracle.signAttestation('oracle-a', {
      processId: oraclePid,
      observedValue: '1000.0',
      asOfUtc,
    });
    const b = oracle.signAttestation('oracle-b', {
      processId: oraclePid,
      observedValue: '1000.0',
      asOfUtc,
    });
    const ok = oracle.require({ processId: oraclePid, attestations: [a, b] });
    if (!ok.ok || ok.validOracleIds.length < 2) {
      fail('oracle.m_of_n', JSON.stringify(ok));
    }
    pass('oracle.m_of_n', `valid=${ok.validOracleIds.join(',')}`);
  } catch (e) {
    fail('oracle.m_of_n', e instanceof Error ? e.message : String(e));
  }

  try {
    const only = oracle.signAttestation('oracle-a', {
      processId: oraclePid,
      asOfUtc: new Date().toISOString(),
    });
    oracle.require({ processId: oraclePid, attestations: [only] });
    fail('oracle.fail_closed', 'expected single-oracle to throw');
  } catch (e) {
    if (e instanceof OracleError || /oracle|ORACLE|fail/i.test(String(e))) {
      pass('oracle.fail_closed', 'single attestation rejected as expected');
    } else {
      fail('oracle.fail_closed', e instanceof Error ? e.message : String(e));
    }
  }

  // --- 4. Partial release (burn + reserve child + remint) ---
  try {
    // Ensure reserve has AST share from primary; holder has mint balance
    // Primary commission funded AST reserve with ~0.45 ARO — release within that pool
    const pr = await orch.partialRelease.run({
      processId: pid('p'),
      institutionId: 'DEMO',
      holderId: 'holder-smoke',
      releaseAmount: '0.200000000',
      idempotencyKey: `idem-smoke-pr-${Date.now()}`,
      holderApproved: true,
      institutionApproved: true,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    if (pr.releaseAmount !== '0.200000000') {
      fail('partial_release.run', `releaseAmount=${pr.releaseAmount}`);
    }
    if (pr.remintAmount !== '999.800000000') {
      fail('partial_release.run', `remintAmount=${pr.remintAmount}`);
    }
    const bal = orch.aroscoin.balanceOf('holder-smoke');
    if (bal !== '999.800000000') {
      fail('partial_release.run', `holder balance ${bal}`);
    }
    const rows = await orch.nodechain.listByProcessId(pr.processId);
    const types = new Set(rows.map((r) => r.recordType));
    if (!types.has('burn_fact') || !types.has('partial_release_fact')) {
      fail('partial_release.run', `journal types ${[...types].join(',')}`);
    }
    pass(
      'partial_release.run',
      `processId=${pr.processId} release=${pr.releaseAmount} remint=${pr.remintAmount} balance=${bal}`,
    );
  } catch (e) {
    fail('partial_release.run', e instanceof Error ? e.message : String(e));
  }

  // --- 5. Chain integrity ---
  try {
    const chain = await orch.nodechain.verifyChain();
    if (!chain.ok) fail('nodechain.verify', chain.error ?? 'broken');
    const tip = await orch.nodechain.getTip();
    pass('nodechain.verify', `ok height=${chain.height} tip=${tip?.height}`);
  } catch (e) {
    fail('nodechain.verify', e instanceof Error ? e.message : String(e));
  }

  print(steps);
  const allOk = steps.every((s) => s.ok);
  console.log(allOk ? '\nSMOKE PASS (C5)' : '\nSMOKE FAIL');
  process.exit(allOk ? 0 : 1);
}

function print(steps: StepResult[]): void {
  console.log('Step results:');
  for (const s of steps) {
    console.log(`  ${s.ok ? 'PASS' : 'FAIL'}  ${s.name}`);
    console.log(`         ${s.detail}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
