# Valuation currency vs ARO

## Problem

Institutional documents state price in **real currencies** (USD, EUR, GEL…).  
AST network mint uses **ARO** (9 decimals) as the **unit of account** after PoT.

AST does **not** appraise and does **not** set market FX rates.

## v1 policy (portal)

| Field | Who fills | Meaning |
|-------|-----------|---------|
| **Amount from document** | Initiator (from paper) | Number as printed on the package |
| **Currency on document** | Initiator (from paper) | USD / EUR / GEL / GBP / CHF / ARO / OTHER |
| **ARO rate field** | **Not shown** | Fixed **1:1** of the document figure → ARO units |
| **ARO mint on Core** | Automatic | Same number as document amount (9 decimals) after PoT |

**Why no rate field:** the initiator must not invent FX or a “final network price” before / outside the document. They only restate **amount + currency** from the signed package.

Example: document says **150 000 USD** → after PoT Core mints **150000.000000000 ARO** (label currency stays USD on the certificate).

This is **not** a market FX rate from AST.

## Later

- Optional institutional multi-rate only via Canon amendment + separate role (not initiator guess).  
- Certificate stores document currency amount and ARO mint.