# Asset types · evidence packages · enrichment (portal)

**Status:** Spec + pilot implementation (wizard step “Asset type” + document slots + enrichment stub)  
**Law:** AST does **not** appraise. Institution provides official valuation. Portal never mints.  
**External bureaus (e.g. credit / asset data providers):** optional **enrichment signals only** — human confirms; never auto-mint.

---

## 1. Problem

One generic “upload any PDF” path does not match institutional reality:

- **Real estate**, **bonds**, **investment packages**, etc. need **different evidentiary documents**.  
- Operator must **choose asset type first**, then see **typed document requests**.  
- Optional third-party data (identity / asset presence / bureau signals) may **enrich** confirmation — not replace the signed package.

---

## 2. Wizard order (updated)

| Step | Name | Action |
|------|------|--------|
| **0** | Asset type | Select `assetType` from catalog |
| **1** | Evidence package | Upload files into **slots** required for that type (required + optional) |
| **2** | E-signature | Attestation / X.509 on package hash |
| **3** | Fields from document | Amount, holder, asset id as stated on docs |
| **4** | Enrichment (optional) | Bureau / external signals — confirm or skip |
| **5** | Start | `POST /v1/tokenization/start` with `assetType` + package hash |

---

## 3. Asset type catalog (v1)

| `assetType` | Label (EN) | Typical evidence |
|-------------|------------|------------------|
| `real_estate` | Real estate | Title / registry extract · valuation report · owner ID annex |
| `bond` | Bond / debt security | Bond terms / certificate · valuation or face schedule · holder statement |
| `investment_package` | Investment package | Package prospectus / schedule · valuation annex · beneficiary schedule |
| `vehicle` | Vehicle | Registration certificate · appraisal · lien clear statement |
| `receivable` | Receivable / invoice claim | Contract · aging / balance statement · debtor id annex |
| `equipment` | Equipment / plant | Asset register · appraisal · ownership proof |
| `other` | Other (institution-defined) | Cover letter · valuation · supporting annex |

OpenAPI enum extended to match. Core still treats valuation as **institutional given**.

---

## 4. Evidence slot model

Each type has ordered slots:

```ts
{
  id: "title_extract",
  label: "Registry / title extract",
  required: true,
  accept: [".pdf", ".asice", ...],
  purpose: "proves ownership / registration of the asset"
}
```

- **Required** slots must each have ≥1 file before continue.  
- Package hash still covers **all** uploaded parts (multi-file), as today.  
- Metadata records `slotId → fileName[]` on process note/metadata.

---

## 5. Enrichment (bureau / Experian-class providers)

### Role

| May do | Must not |
|--------|----------|
| Return structured **signals** (match scores, flags, reference ids) | Set mint amount |
| Help institution confirm holder / asset presence | Replace e-sign package |
| Be skipped in pilot | Run as silent auto-approve |

### API

`POST /v1/enrichment/check` (session required)

```json
{
  "assetType": "real_estate",
  "holderId": "…",
  "assetId": "…",
  "documentPackageHash": "…",
  "amountFromDocument": "250000.00",
  "currency": "USD"
}
```

Response (example):

```json
{
  "ok": true,
  "provider": "mock",
  "enrichmentId": "…",
  "signals": {
    "identityMatch": "unknown|likely|mismatch",
    "assetPresence": "unknown|indicated|not_found",
    "valueContext": "unknown|consistent|review",
    "notes": ["…"]
  },
  "disclaimer": "Assist only. Institution confirms. AST does not appraise."
}
```

### Providers

| `AST_ENRICHMENT_PROVIDER` | Behavior |
|--------------------------|----------|
| `mock` (default) | Deterministic pilot signals from hash/holder |
| `http` | `POST` to `AST_ENRICHMENT_URL` with same body (institution adapter / future bureau gateway) |
| off / skip | Wizard allows continue without call |

**Live Experian (or other bureau) credentials** never in git — only via secrets env on the **gateway** behind `AST_ENRICHMENT_URL`. Direct vendor SDK in portal is residual (contracts, DPIA, jurisdiction).

---

## 6. Acceptance (pilot)

| Check | Evidence |
|-------|----------|
| Spec | this file |
| Catalog API | `GET /v1/catalog/asset-types`, `GET /v1/catalog/evidence-requirements` |
| Wizard step 0 → typed slots | portal tokenization UI |
| Enrichment stub | `POST /v1/enrichment/check` |
| No auto-mint from enrichment | code review + Canon |

## Residual

- Full Experian production connector + legal agreements  
- Jurisdiction-specific document taxonomies beyond v1 catalog  
- OCR auto-fill of slot labels from image packs  
