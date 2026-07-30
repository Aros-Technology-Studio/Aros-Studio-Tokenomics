/**
 * External enrichment signals (bureau / gateway) — assist only.
 * Never sets mint amount. Never replaces document package.
 */
import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

export type EnrichmentInput = {
  assetType: string;
  holderId?: string;
  assetId?: string;
  documentPackageHash?: string;
  amountFromDocument?: string;
  currency?: string;
  institutionId: string;
};

export type EnrichmentResult = {
  ok: true;
  provider: string;
  enrichmentId: string;
  signals: {
    identityMatch: 'unknown' | 'likely' | 'mismatch';
    assetPresence: 'unknown' | 'indicated' | 'not_found';
    valueContext: 'unknown' | 'consistent' | 'review';
    notes: string[];
  };
  disclaimer: string;
  checkedAt: string;
};

@Injectable()
export class EnrichmentService {
  async check(input: EnrichmentInput): Promise<EnrichmentResult> {
    const provider = (process.env.AST_ENRICHMENT_PROVIDER ?? 'mock').toLowerCase();
    if (provider === 'http' || provider === 'gateway') {
      return this.httpProvider(input);
    }
    return this.mockProvider(input);
  }

  private mockProvider(input: EnrichmentInput): EnrichmentResult {
    const seed = createHash('sha256')
      .update(
        [
          input.institutionId,
          input.assetType,
          input.holderId ?? '',
          input.assetId ?? '',
          input.documentPackageHash ?? '',
          input.amountFromDocument ?? '',
        ].join('|'),
      )
      .digest('hex');
    const n = parseInt(seed.slice(0, 8), 16);
    const identityMatch = n % 17 === 0 ? 'mismatch' : n % 3 === 0 ? 'unknown' : 'likely';
    const assetPresence = n % 19 === 0 ? 'not_found' : n % 5 === 0 ? 'unknown' : 'indicated';
    const valueContext =
      n % 13 === 0 ? 'review' : input.amountFromDocument ? 'consistent' : 'unknown';

    const notes: string[] = [
      'Mock enrichment for pilot — not a live credit bureau response.',
      `Asset type ${input.assetType}: signals are deterministic from package context.`,
    ];
    if (identityMatch === 'mismatch') {
      notes.push('Review holder identity against package (mock flag).');
    }
    if (assetPresence === 'not_found') {
      notes.push('Asset presence not indicated in mock bureau (review documents).');
    }
    if (valueContext === 'review') {
      notes.push('Value context flagged for human review (mock).');
    }

    return {
      ok: true,
      provider: 'mock',
      enrichmentId: `enrich-mock-${randomBytes(8).toString('hex')}`,
      signals: { identityMatch, assetPresence, valueContext, notes },
      disclaimer:
        'Assist only. Institution confirms facts from signed documents. AST does not appraise or mint from enrichment.',
      checkedAt: new Date().toISOString(),
    };
  }

  private async httpProvider(input: EnrichmentInput): Promise<EnrichmentResult> {
    const url = process.env.AST_ENRICHMENT_URL?.trim();
    if (!url) {
      return {
        ...this.mockProvider(input),
        provider: 'mock_fallback',
        signals: {
          ...this.mockProvider(input).signals,
          notes: [
            'AST_ENRICHMENT_URL unset — fell back to mock.',
            'Configure gateway URL for live bureau (Experian-class) integration.',
          ],
        },
      };
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.AST_ENRICHMENT_API_KEY
          ? { authorization: `Bearer ${process.env.AST_ENRICHMENT_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(`enrichment gateway HTTP ${res.status}`);
    }
    const body = (await res.json()) as Partial<EnrichmentResult>;
    return {
      ok: true,
      provider: String(body.provider ?? 'http'),
      enrichmentId: String(body.enrichmentId ?? `enrich-http-${randomBytes(6).toString('hex')}`),
      signals: {
        identityMatch: body.signals?.identityMatch ?? 'unknown',
        assetPresence: body.signals?.assetPresence ?? 'unknown',
        valueContext: body.signals?.valueContext ?? 'unknown',
        notes: body.signals?.notes ?? ['Gateway response accepted.'],
      },
      disclaimer:
        body.disclaimer ??
        'Assist only. Institution confirms. AST does not appraise or mint from enrichment.',
      checkedAt: new Date().toISOString(),
    };
  }
}
