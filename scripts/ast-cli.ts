/**
 * Minimal internal CLI (no Nest decorator metadata required — works under tsx).
 *
 * Usage:
 *   npm run cli -- tokenize --inst DEMO --valuation 100 --holder h1
 *   npm run cli -- integrity
 */
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AroscoinService } from '../src/aroscoin/aroscoin.service';
import { KillSwitchService } from '../src/common/kill-switch.service';
import { CommissionService } from '../src/commission/commission.service';
import { EmissionService } from '../src/emission/emission.service';
import { InvariantsService } from '../src/invariants/invariants.service';
import { MemoryLedgerStore } from '../src/nodechain/memory-ledger.store';
import { NodechainService } from '../src/nodechain/nodechain.service';
import { OracleGatewayService } from '../src/oracle-gateway/oracle-gateway.service';
import { OrchestratorService } from '../src/orchestrator/orchestrator.service';
import { PotService } from '../src/pot/pot.service';
import { ReserveService } from '../src/reserve/reserve.service';
import { StateRecordingService } from '../src/state-recording/state-recording.service';
import { ModuleRef } from '@nestjs/core';

function buildOrchestrator(): {
  orch: OrchestratorService;
  coin: AroscoinService;
  nodechain: NodechainService;
} {
  const events = new EventEmitter2();
  const invariants = new InvariantsService(events);
  const store = new MemoryLedgerStore();
  const nodechain = new NodechainService(store);
  const pot = new PotService(nodechain, invariants);
  const emission = new EmissionService(pot, invariants);
  const aroscoin = new AroscoinService(pot, nodechain, invariants);
  const reserve = new ReserveService(invariants);
  const commission = new CommissionService(pot, nodechain, reserve);
  const oracle = new OracleGatewayService(nodechain);
  const state = new StateRecordingService(nodechain);
  const kill = new KillSwitchService();
  kill.setActive(false);

  // Minimal ModuleRef-like shim for OrchestratorService
  const map = new Map<unknown, unknown>([
    [PotService, pot],
    [EmissionService, emission],
    [AroscoinService, aroscoin],
    [CommissionService, commission],
    [ReserveService, reserve],
    [NodechainService, nodechain],
    [OracleGatewayService, oracle],
    [StateRecordingService, state],
    [KillSwitchService, kill],
  ]);
  const moduleRef = {
    get: (token: unknown) => {
      const v = map.get(token);
      if (!v) throw new Error(`missing ${String(token)}`);
      return v;
    },
  } as unknown as ModuleRef;

  const orch = new OrchestratorService(moduleRef);
  orch.onModuleInit();
  return { orch, coin: aroscoin, nodechain };
}

async function main(): Promise<void> {
  const [cmd] = process.argv.slice(2);
  const args = parseArgs(process.argv.slice(3));
  const { orch, coin, nodechain } = buildOrchestrator();

  if (cmd === 'tokenize') {
    const inst = String(args.inst ?? 'DEMO');
    const valuation = String(args.valuation ?? '100');
    const holder = String(args.holder ?? 'holder-1');
    const start = orch.startProcess({
      institutionCode: inst,
      idempotencyKey: String(args.key ?? `cli-${Date.now()}`),
      institutionalValuation: valuation,
      currency: String(args.currency ?? 'GEL'),
      assetType: String(args.assetType ?? 'bond'),
      holderId: holder,
    });
    const done = orch.runFromPot(
      start.processId,
      { P1: true, P2: true, P3: true, P4: true },
      { n1: '1', n2: '1' },
    );
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          processId: done.processId,
          status: done.status,
          claimId: done.claimId,
          balance: coin.balanceOf(holder),
          ledgerHeight: nodechain.getHeight(),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (cmd === 'integrity') {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        height: nodechain.getHeight(),
        ...nodechain.verifyIntegrity(),
      }),
    );
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Usage: npm run cli -- tokenize|integrity [--inst DEMO --valuation 100 --holder h1]');
  process.exitCode = 1;
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      out[a.slice(2)] = argv[i + 1] ?? 'true';
      i++;
    }
  }
  return out;
}

void main();
