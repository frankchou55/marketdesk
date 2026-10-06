/// <reference lib="webworker" />

import type { BinanceTick } from './market-socket.service';

// Receives a 100ms buffer of raw ticks from MarketSocketService and collapses it
// to the latest tick per symbol, so the store only gets one update per symbol per flush.
addEventListener('message', ({ data }: MessageEvent<BinanceTick[]>) => {
  const latest = new Map<string, BinanceTick>();
  for (const tick of data) {
    const prev = latest.get(tick.s);
    if (!prev || tick.E >= prev.E) {
      latest.set(tick.s, tick);
    }
  }
  postMessage(Array.from(latest.values()));
});
