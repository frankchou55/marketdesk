import { toTicker } from './market.effects';

describe('toTicker', () => {
  const raw = { s: 'BTCUSDT', c: '110', o: '100', h: '120', l: '90', v: '5000', a: 110.5, b: 109.5, E: 1700000000000 };

  it('maps Binance fields and derives change and change %', () => {
    expect(toTicker(raw)).toEqual({
      symbol: 'BTCUSDT',
      price: 110,
      change: 10,
      changePercent: 10,
      volume: 5000,
      bid: 109.5,
      ask: 110.5,
      timestamp: 1700000000000,
    });
  });

  it('reports a negative change when price is below the 24h open', () => {
    const t = toTicker({ ...raw, c: '90' });
    expect(t.change).toBe(-10);
    expect(t.changePercent).toBe(-10);
  });

  it('does not divide by zero when the open is 0', () => {
    expect(toTicker({ ...raw, o: '0' }).changePercent).toBe(0);
  });
});
