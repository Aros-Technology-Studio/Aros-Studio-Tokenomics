/**
 * I3 — optional outbound fan-out (HTTP webhook and/or Kafka-compatible produce).
 * Not SoT. Failures never block journal append.
 *
 * Env:
 *   AST_EVENT_OUT_URL          POST JSON each observer event
 *   AST_EVENT_OUT_KAFKA_BROKERS  host:port[,host:port]  (uses rpk/kcat if present, else skip)
 *   AST_EVENT_OUT_KAFKA_TOPIC    default ast.journal.events
 */
import { spawnSync } from 'child_process';
import type { ObserverEvent } from './types';

export type EventOutResult = {
  http?: { ok: boolean; status?: number };
  kafka?: { ok: boolean; engine?: string; error?: string };
};

export function eventOutConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.AST_EVENT_OUT_URL?.trim() || env.AST_EVENT_OUT_KAFKA_BROKERS?.trim());
}

export async function fanOutObserverEvent(
  event: ObserverEvent,
  env: NodeJS.ProcessEnv = process.env,
): Promise<EventOutResult> {
  const out: EventOutResult = {};
  const body = JSON.stringify({
    source: 'ast-observer',
    not_sot: true,
    event,
  });

  const url = env.AST_EVENT_OUT_URL?.trim();
  if (url) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      out.http = { ok: res.ok, status: res.status };
    } catch {
      out.http = { ok: false };
    }
  }

  const brokers = env.AST_EVENT_OUT_KAFKA_BROKERS?.trim();
  if (brokers) {
    const topic = env.AST_EVENT_OUT_KAFKA_TOPIC?.trim() || 'ast.journal.events';
    out.kafka = produceViaCli(brokers, topic, body);
  }

  return out;
}

/**
 * Prefer `rpk topic produce` (Redpanda) when available — no hard kafkajs dependency.
 */
function produceViaCli(
  brokers: string,
  topic: string,
  body: string,
): { ok: boolean; engine?: string; error?: string } {
  const broker = brokers.split(',')[0]?.trim();
  if (!broker) return { ok: false, error: 'no broker' };

  // rpk: redpanda
  try {
    const r = spawnSync(
      'rpk',
      ['topic', 'produce', topic, '-b', broker, '-f', '%v'],
      {
        input: body + '\n',
        encoding: 'utf8',
        timeout: 8000,
      },
    );
    if (r.status === 0) return { ok: true, engine: 'rpk' };
  } catch {
    /* try kcat */
  }

  try {
    const r = spawnSync('kcat', ['-P', '-b', broker, '-t', topic], {
      input: body + '\n',
      encoding: 'utf8',
      timeout: 8000,
    });
    if (r.status === 0) return { ok: true, engine: 'kcat' };
    return {
      ok: false,
      engine: 'none',
      error: 'rpk/kcat not available or produce failed — install rpk or set HTTP sink',
    };
  } catch {
    return {
      ok: false,
      engine: 'none',
      error: 'rpk/kcat not available — install rpk or set AST_EVENT_OUT_URL',
    };
  }
}
