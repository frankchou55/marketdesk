import type { BinanceTick } from './market-socket.service';

/** Collapses a buffer of raw ticks to the newest tick per symbol. */
export function latestPerSymbol(ticks: BinanceTick[]): BinanceTick[] {
  const latest = new Map<string, BinanceTick>();
  for (const tick of ticks) {
    const prev = latest.get(tick.s);
    if (!prev || tick.E >= prev.E) {
      latest.set(tick.s, tick);
    }
  }
  return Array.from(latest.values());
}
