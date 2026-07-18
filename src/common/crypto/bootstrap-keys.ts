import { KeyRegistry } from './key-registry';

/** Standard writer + confirmer key ids used by the pipeline. */
export const PIPELINE_KEY_IDS = [
  'system',
  'orchestrator',
  'pot',
  'token',
  'emission',
  'settlement',
  'governance',
  'v1',
  'v2',
  'v3',
  'oracle-a',
  'oracle-b',
  'oracle-c',
] as const;

export function bootstrapPipelineKeys(registry: KeyRegistry = new KeyRegistry()): KeyRegistry {
  for (const id of PIPELINE_KEY_IDS) {
    if (!registry.hasPrivate(id)) {
      registry.registerGenerated(id);
    }
  }
  return registry;
}
