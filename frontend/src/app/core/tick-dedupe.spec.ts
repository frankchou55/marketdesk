import { latestPerSymbol } from './tick-dedupe';
import type { BinanceTick } from './market-socket.service';

const tick = (s: string, E: number, c = '1'): BinanceTick => ({ s, E, c, o: '1', h: '1', l: '1', v: '1', a: 1, b: 1 });

describe('latestPerSymbol', () => {
  it('keeps only the newest tick per symbol', () => {
    const out = latestPerSymbol([tick('BTCUSDT', 1, '10'), tick('ETHUSDT', 2), tick('BTCUSDT', 3, '12')]);
    expect(out).toHaveLength(2);
    expect(out.find((t) => t.s === 'BTCUSDT')?.c).toBe('12');
  });

  it('is order-independent: an older tick arriving late does not win', () => {
    const out = latestPerSymbol([tick('BTCUSDT', 5, '15'), tick('BTCUSDT', 2, '12')]);
    expect(out[0].c).toBe('15');
  });

  it('returns an empty array for an empty buffer', () => {
    expect(latestPerSymbol([])).toEqual([]);
  });
});
