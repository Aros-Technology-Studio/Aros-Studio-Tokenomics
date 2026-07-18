/**
 * HTTP client from Portal edge → AST Core API.
 * Core remains SoT; edge validates admission then hands off.
 */
export interface CoreClientConfig {
  baseUrl: string;
  timeoutMs?: number;
}

export interface CoreCreateProcessRequest {
  processType?: string;
  valuation: string;
  holderId: string;
  assetId?: string;
  processId?: string;
  hasQualifiedSignature: boolean;
  documentPackageHash?: string;
  feeRate?: number;
  hasDocuments?: boolean;
  institutionAllowlisted?: boolean;
  note?: string;
}

export class CoreApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config?: Partial<CoreClientConfig>) {
    this.baseUrl = (
      config?.baseUrl ??
      process.env.CORE_API_URL ??
      process.env.AST_CORE_URL ??
      'http://localhost:3000'
    ).replace(/\/$/, '');
    this.timeoutMs = config?.timeoutMs ?? 60_000;
  }

  get enabled(): boolean {
    const flag = process.env.PORTAL_CORE_HANDOFF;
    if (flag === '0' || flag === 'false') return false;
    return true;
  }

  async createProcess(
    body: CoreCreateProcessRequest,
    headers: { institutionId: string; idempotencyKey: string; institutionToken?: string },
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request('POST', '/v1/core/processes', body, headers);
  }

  async getProcess(
    processId: string,
    institutionId?: string,
    institutionToken?: string,
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request(
      'GET',
      `/v1/core/processes/${encodeURIComponent(processId)}`,
      undefined,
      institutionId
        ? { institutionId, idempotencyKey: 'status-read', institutionToken }
        : undefined,
    );
  }

  async getReleaseStatus(): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request('GET', '/v1/core/release');
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
    headers?: { institutionId?: string; idempotencyKey?: string; institutionToken?: string },
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const token =
      headers?.institutionToken ??
      process.env.AST_INSTITUTION_TOKEN ??
      process.env.PORTAL_INSTITUTION_TOKEN;
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'content-type': 'application/json',
          ...(headers?.institutionId
            ? { 'X-Institution-Id': headers.institutionId }
            : {}),
          ...(headers?.idempotencyKey
            ? { 'Idempotency-Key': headers.idempotencyKey }
            : {}),
          ...(token ? { 'X-Institution-Token': token } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      let parsed: Record<string, unknown> = {};
      try {
        parsed = (await res.json()) as Record<string, unknown>;
      } catch {
        parsed = { message: await res.text() };
      }
      return { statusCode: res.status, body: parsed };
    } catch (e) {
      return {
        statusCode: 503,
        body: {
          code: 'CORE_UNAVAILABLE',
          message: e instanceof Error ? e.message : String(e),
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
