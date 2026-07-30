import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEvidenceRequirements,
  isKnownAssetType,
  listAssetTypes,
} from './asset-evidence-catalog';

describe('asset-evidence-catalog', () => {
  it('lists asset types including real_estate', () => {
    const types = listAssetTypes();
    assert.ok(types.some((t) => t.id === 'real_estate'));
    assert.ok(types.some((t) => t.id === 'bond'));
    assert.ok(types.length >= 5);
  });

  it('real_estate has required title + valuation slots', () => {
    const def = getEvidenceRequirements('real_estate');
    assert.ok(def);
    const required = def!.slots.filter((s) => s.required).map((s) => s.id);
    assert.ok(required.includes('title_registry'));
    assert.ok(required.includes('valuation_report'));
  });

  it('unknown type is rejected', () => {
    assert.equal(isKnownAssetType('spaceship'), false);
    assert.equal(getEvidenceRequirements('spaceship'), null);
  });
});
