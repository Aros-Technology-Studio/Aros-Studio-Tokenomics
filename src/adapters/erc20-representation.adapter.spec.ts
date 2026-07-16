import { Erc20RepresentationAdapter } from './erc20-representation.adapter';

describe('Erc20RepresentationAdapter', () => {
  it('exposes view-only ERC-20 surface without canonical mint', () => {
    const a = new Erc20RepresentationAdapter(
      () => '10.000000000',
      () => '100.000000000',
    );
    expect(a.symbol).toBe('ARO');
    expect(a.decimals).toBe(9);
    expect(a.balanceOf('0xabc')).toBe('10.000000000');
    expect(() => a.transfer()).toThrow(/canonical/i);
  });
});
