import { promises as fs } from 'fs';
import * as path from 'path';
import { KeyRegistry } from './key-registry';
import type { KeyPair } from './ed25519';
import { bootstrapPipelineKeys, PIPELINE_KEY_IDS } from './bootstrap-keys';

interface StoredKeys {
  version: 1;
  pairs: KeyPair[];
}

export function keysPathForJournal(journalDir: string): string {
  return path.join(journalDir, '.ast-keys.json');
}

/**
 * Load or create pipeline keys next to the journal directory.
 * Dev/demo persistence — production should use HSM and distribute public keys only.
 */
export async function loadOrCreateKeys(journalDir: string): Promise<KeyRegistry> {
  const keyPath = keysPathForJournal(journalDir);
  const reg = new KeyRegistry();
  try {
    const raw = await fs.readFile(keyPath, 'utf8');
    const stored = JSON.parse(raw) as StoredKeys;
    for (const kp of stored.pairs) {
      reg.registerKeyPair(kp);
    }
    for (const id of PIPELINE_KEY_IDS) {
      if (!reg.hasPrivate(id)) reg.registerGenerated(id);
    }
  } catch {
    bootstrapPipelineKeys(reg);
  }
  await fs.mkdir(journalDir, { recursive: true });
  await saveKeys(journalDir, reg);
  return reg;
}

export async function saveKeys(journalDir: string, reg: KeyRegistry): Promise<void> {
  const body: StoredKeys = { version: 1, pairs: reg.listKeyPairs() };
  await fs.writeFile(keysPathForJournal(journalDir), JSON.stringify(body, null, 2), 'utf8');
}
