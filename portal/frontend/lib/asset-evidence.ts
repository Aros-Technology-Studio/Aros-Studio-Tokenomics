/**
 * Client mirror of portal catalog (same ids as backend asset-evidence-catalog).
 * Prefer live GET /v1/catalog/* when session available.
 */

export type EvidenceSlot = {
  id: string;
  label: string;
  required: boolean;
  purpose: string;
  acceptHint: string;
};

export type AssetTypeSummary = {
  id: string;
  label: string;
  description: string;
};

export type AssetTypeDef = AssetTypeSummary & { slots: EvidenceSlot[] };

const PDF = '.pdf,.PDF,.xml,.asice,.adoc,.edoc,.zip,application/pdf';

/** Fallback if catalog API unavailable */
export const FALLBACK_CATALOG: AssetTypeDef[] = [
  {
    id: 'real_estate',
    label: 'Real estate',
    description: 'Land, buildings, cadastral property packages.',
    slots: [
      {
        id: 'title_registry',
        label: 'Title / public registry extract',
        required: true,
        purpose: 'Proves registration and ownership identity of the property.',
        acceptHint: PDF,
      },
      {
        id: 'valuation_report',
        label: 'Institutional valuation report',
        required: true,
        purpose: 'Official valuation amount and currency as stated by the institution.',
        acceptHint: PDF,
      },
      {
        id: 'owner_id_annex',
        label: 'Owner / holder identity annex',
        required: false,
        purpose: 'Optional link between registry owner and process holderId.',
        acceptHint: PDF,
      },
    ],
  },
  {
    id: 'bond',
    label: 'Bond / debt security',
    description: 'Bonds and similar debt instruments.',
    slots: [
      {
        id: 'instrument_terms',
        label: 'Bond terms / certificate',
        required: true,
        purpose: 'Identifies the instrument and contractual terms.',
        acceptHint: PDF,
      },
      {
        id: 'valuation_or_face',
        label: 'Valuation or face/schedule annex',
        required: true,
        purpose: 'Official figure used as institutional valuation input.',
        acceptHint: PDF,
      },
      {
        id: 'holder_statement',
        label: 'Holder statement',
        required: false,
        purpose: 'Optional proof of current beneficial holder.',
        acceptHint: PDF,
      },
    ],
  },
  {
    id: 'investment_package',
    label: 'Investment package',
    description: 'Bundled investment schedules / structured packages.',
    slots: [
      {
        id: 'package_schedule',
        label: 'Package prospectus / schedule',
        required: true,
        purpose: 'Defines package composition and identifiers.',
        acceptHint: PDF,
      },
      {
        id: 'valuation_annex',
        label: 'Valuation annex',
        required: true,
        purpose: 'Institutional package valuation as stated.',
        acceptHint: PDF,
      },
      {
        id: 'beneficiary_schedule',
        label: 'Beneficiary schedule',
        required: false,
        purpose: 'Optional holders/beneficiaries list.',
        acceptHint: PDF,
      },
    ],
  },
  {
    id: 'vehicle',
    label: 'Vehicle',
    description: 'Registered vehicles and similar movable assets.',
    slots: [
      {
        id: 'registration_cert',
        label: 'Vehicle registration certificate',
        required: true,
        purpose: 'Proves registration identity of the asset.',
        acceptHint: PDF,
      },
      {
        id: 'appraisal',
        label: 'Institutional appraisal',
        required: true,
        purpose: 'Official valuation figure for the vehicle.',
        acceptHint: PDF,
      },
      {
        id: 'lien_clear',
        label: 'Lien / encumbrance statement',
        required: false,
        purpose: 'Optional clear title / lien status.',
        acceptHint: PDF,
      },
    ],
  },
  {
    id: 'receivable',
    label: 'Receivable / invoice claim',
    description: 'Trade receivables and contractual claims.',
    slots: [
      {
        id: 'underlying_contract',
        label: 'Underlying contract / invoice set',
        required: true,
        purpose: 'Identifies the claim and counterparties.',
        acceptHint: PDF,
      },
      {
        id: 'balance_statement',
        label: 'Balance / aging statement',
        required: true,
        purpose: 'Official outstanding amount used as valuation input.',
        acceptHint: PDF,
      },
      {
        id: 'debtor_id',
        label: 'Debtor identity annex',
        required: false,
        purpose: 'Optional debtor identification package.',
        acceptHint: PDF,
      },
    ],
  },
  {
    id: 'equipment',
    label: 'Equipment / plant',
    description: 'Machinery, plant, and equipment registers.',
    slots: [
      {
        id: 'asset_register',
        label: 'Asset register extract',
        required: true,
        purpose: 'Identifies equipment units and ownership.',
        acceptHint: PDF,
      },
      {
        id: 'appraisal',
        label: 'Institutional appraisal',
        required: true,
        purpose: 'Official valuation of the equipment package.',
        acceptHint: PDF,
      },
      {
        id: 'ownership_proof',
        label: 'Ownership / purchase proof',
        required: false,
        purpose: 'Optional invoices or transfer deeds.',
        acceptHint: PDF,
      },
    ],
  },
  {
    id: 'other',
    label: 'Other (institution-defined)',
    description: 'Catch-all when no dedicated type fits.',
    slots: [
      {
        id: 'cover_letter',
        label: 'Institution cover letter',
        required: true,
        purpose: 'States asset description and eligibility.',
        acceptHint: PDF,
      },
      {
        id: 'valuation',
        label: 'Institutional valuation',
        required: true,
        purpose: 'Official valuation amount and currency.',
        acceptHint: PDF,
      },
      {
        id: 'supporting',
        label: 'Supporting annex',
        required: false,
        purpose: 'Any additional institutional evidence.',
        acceptHint: PDF,
      },
    ],
  },
];

export function requiredSlotsOk(
  slots: EvidenceSlot[],
  slotFiles: Record<string, File[]>,
): boolean {
  return slots
    .filter((s) => s.required)
    .every((s) => (slotFiles[s.id]?.length ?? 0) > 0);
}

export function flattenSlotFiles(slotFiles: Record<string, File[]>): File[] {
  const out: File[] = [];
  for (const [slotId, list] of Object.entries(slotFiles)) {
    for (const f of list) {
      // Prefix slot for stable multi-file hash identity
      out.push(new File([f], `${slotId}__${f.name}`, { type: f.type }));
    }
  }
  return out;
}
