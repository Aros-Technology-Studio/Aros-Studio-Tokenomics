/**
 * Portal BFF client helpers.
 * Prefer same-origin (Next rewrites /v1 → edge) for home / tunnel deploys.
 */
export { apiBase, portalFetch } from './auth';
