import { promises as fs } from 'fs';
import * as path from 'path';
import { KeyRegistry } from './key-registry';
import type { KeyPair } from './ed25519';
import { bootstrapPipelineKeys, PIPELINE_KEY_IDS } from './bootstrap-keys';
import {
  HsmKeyProvider,
  RegistryKeyProvider,
  resolveKeyProviderKind,
  type KeyProvider,
} from './key-provider';

interface StoredKeys {
  version: 1;
  pairs: KeyPair[];
}

export function keysPathForJournal(journalDir: string): string {
  return path.join(journalDir, '.ast-keys.json');
}

export function hsmVaultPathForJournal(journalDir: string): string {
  return path.join(journalDir, '.ast-hsm-vault.json');
}

/**
 * Load or create pipeline keys next to the journal directory.
 * AST_KEY_PROVIDER=memory|file|hsm (default file for dev, hsm for prod).
 */
export async function loadOrCreateKeys(journalDir: string): Promise<KeyRegistry> {
  const provider = await loadOrCreateKeyProvider(journalDir);
  const reg = provider.asKeyRegistry?.();
  if (reg) return reg;
  if (provider instanceof HsmKeyProvider) {
    return provider.toSigningRegistry();
  }
  // fallback
  const r = new KeyRegistry();
  bootstrapPipelineKeys(r);
  return r;
}

export async function loadOrCreateKeyProvider(journalDir: string): Promise<KeyProvider> {
  const kind = resolveKeyProviderKind();
  await fs.mkdir(journalDir, { recursive: true });

  if (kind === 'hsm') {
    return HsmKeyProvider.loadOrCreate(hsmVaultPathForJournal(journalDir), PIPELINE_KEY_IDS);
  }

  if (kind === 'memory') {
    const reg = new KeyRegistry();
    bootstrapPipelineKeys(reg);
    return new RegistryKeyProvider(reg, 'memory');
  }

  // file (default dev)
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
  await saveKeys(journalDir, reg);
  return new RegistryKeyProvider(reg, 'file');
}

export async function saveKeys(journalDir: string, reg: KeyRegistry): Promise<void> {
  const body: StoredKeys = { version: 1, pairs: reg.listKeyPairs() };
  await fs.writeFile(keysPathForJournal(journalDir), JSON.stringify(body, null, 2), 'utf8');
}
