import { ValidatorRegistry } from './validator-registry';

describe('ValidatorRegistry (active/suspended)', () => {
  it('registerMany and listActive', () => {
    const reg = ValidatorRegistry.fromActiveIds(['v1', 'v2', 'v3']);
    expect(reg.listActive()).toEqual(['v1', 'v2', 'v3']);
  });

  it('suspend excludes from eligible set', () => {
    const reg = new ValidatorRegistry();
    reg.registerMany(['v1', 'v2', 'v3']);
    reg.suspend('v2', 'offline');
    expect(reg.isSuspended('v2')).toBe(true);
    expect(reg.resolveEligible(['v1', 'v2', 'v3'])).toEqual(['v1', 'v3']);
    expect(reg.listSuspended()).toEqual(['v2']);
  });

  it('restore returns to active', () => {
    const reg = new ValidatorRegistry();
    reg.register('v1');
    reg.suspend('v1', 'temp');
    reg.restore('v1');
    expect(reg.isActive('v1')).toBe(true);
    expect(reg.resolveEligible(['v1'])).toEqual(['v1']);
  });

  it('empty registry bootstrap uses proposed set', () => {
    const reg = new ValidatorRegistry();
    expect(reg.resolveEligible(['a', 'b'])).toEqual(['a', 'b']);
  });
});
