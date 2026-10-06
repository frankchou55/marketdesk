/// <reference lib="webworker" />

import type { BinanceTick } from './market-socket.service';
import { latestPerSymbol } from './tick-dedupe';

// Receives a 100ms buffer of raw ticks from MarketSocketService and collapses it
// to the latest tick per symbol, so the store only gets one update per symbol per flush.
addEventListener('message', ({ data }: MessageEvent<BinanceTick[]>) => {
  postMessage(latestPerSymbol(data));
});
