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
    // Primary tokenization can exceed 60s under load — allow long hand-off
    this.timeoutMs =
      config?.timeoutMs ??
      (process.env.CORE_HTTP_TIMEOUT_MS
        ? Number(process.env.CORE_HTTP_TIMEOUT_MS)
        : 180_000);
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

  /** Resume stuck Core process (awaiting_pot → PoT → mint). */
  async continueProcess(
    processId: string,
    headers: { institutionId: string; institutionToken?: string },
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request(
      'POST',
      `/v1/core/processes/${encodeURIComponent(processId)}/continue`,
      {},
      {
        institutionId: headers.institutionId,
        idempotencyKey: `continue-${processId}`.slice(0, 128),
        institutionToken: headers.institutionToken,
      },
    );
  }

  async getReleaseStatus(): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request('GET', '/v1/core/release');
  }

  /** NodeChain read surface (SoT journal) — portal never appends. */
  async getNodechainStatus(): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request('GET', '/v1/core/nodechain/status');
  }

  async getNodechainTip(): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request('GET', '/v1/core/nodechain/tip');
  }

  async getNodechainVerify(): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request('GET', '/v1/core/nodechain/verify');
  }

  async getNodechainByHeight(
    height: number,
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request('GET', `/v1/core/nodechain/records/height/${height}`);
  }

  async getNodechainByRecordId(
    recordId: string,
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    return this.request(
      'GET',
      `/v1/core/nodechain/records/id/${encodeURIComponent(recordId)}`,
    );
  }

  async getNodechainByProcess(
    processId: string,
    limit?: number,
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    const q = limit != null ? `?limit=${limit}` : '';
    return this.request(
      'GET',
      `/v1/core/nodechain/processes/${encodeURIComponent(processId)}${q}`,
    );
  }

  async getNodechainBlocks(
    limit?: number,
  ): Promise<{ statusCode: number; body: Record<string, unknown> }> {
    const q = limit != null ? `?limit=${limit}` : '';
    return this.request('GET', `/v1/core/nodechain/blocks${q}`);
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
