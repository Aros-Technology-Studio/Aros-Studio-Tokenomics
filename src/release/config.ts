/**
 * Release Phase config keys (P0–P4 / Canon §XII).
 * Numeric values from env only — no hard-coded production thresholds in product logic.
 */
export interface ReleaseConfig {
  /** reserveIndex must exceed this (config: release.threshold). */
  threshold: number;
  /** velocity must exceed this (config: release.target). */
  target: number;
}

export function loadReleaseConfig(env: NodeJS.ProcessEnv = process.env): ReleaseConfig {
  const threshold = Number(env['RELEASE_THRESHOLD'] ?? env['release.threshold'] ?? '0');
  const target = Number(env['RELEASE_TARGET'] ?? env['release.target'] ?? '0');
  return {
    threshold: Number.isFinite(threshold) ? threshold : 0,
    target: Number.isFinite(target) ? target : 0,
  };
}
