import { marketReducer, MarketState, adapter } from './market.reducer';
import * as A from './market.actions';
import { Ticker } from '../../shared/models/ticker.model';

const t = (symbol: string, price = 1): Ticker => ({ symbol, price, change: 0, changePercent: 0, volume: 0, bid: 0, ask: 0, timestamp: 0 });
const initial = marketReducer(undefined, { type: '@@init' });
const withRows = (...rows: Ticker[]): MarketState => adapter.setAll(rows, initial);

describe('marketReducer', () => {
  it('upserts ticks by symbol instead of duplicating rows', () => {
    let s = marketReducer(initial, A.ticksReceived({ batch: [t('BTCUSDT', 1)] }));
    s = marketReducer(s, A.ticksReceived({ batch: [t('BTCUSDT', 2), t('ETHUSDT', 5)] }));
    expect(s.ids).toHaveLength(2);
    expect(s.entities['BTCUSDT']?.price).toBe(2);
  });

  it('tracks connection status', () => {
    const s = marketReducer(initial, A.connectionStatusChanged({ state: 'live', message: 'Connected' }));
    expect(s.connection).toBe('live');
    expect(s.connectionMessage).toBe('Connected');
  });

  describe('watchlist', () => {
    it('marks an added symbol as pending until its first tick', () => {
      let s = marketReducer(initial, A.symbolAdded({ symbol: 'SOLUSDT' }));
      expect(s.pending).toEqual(['SOLUSDT']);
      s = marketReducer(s, A.ticksReceived({ batch: [t('SOLUSDT')] }));
      expect(s.pending).toEqual([]);
      expect(s.entities['SOLUSDT']).toBeDefined();
    });

    it('rejects a duplicate with a message and does not mark it pending', () => {
      const s = marketReducer(withRows(t('BTCUSDT')), A.symbolAdded({ symbol: 'BTCUSDT' }));
      expect(s.watchError).toContain('already on the watchlist');
      expect(s.pending).toEqual([]);
    });

    it('does not duplicate a symbol that is already pending', () => {
      let s = marketReducer(initial, A.symbolAdded({ symbol: 'SOLUSDT' }));
      s = marketReducer(s, A.symbolAdded({ symbol: 'SOLUSDT' }));
      expect(s.pending).toEqual(['SOLUSDT']);
    });

    it('clears a previous error when a new symbol is added', () => {
      let s = marketReducer(initial, A.symbolFailed({ symbol: 'XXX', reason: 'nope' }));
      expect(s.watchError).toBe('nope');
      s = marketReducer(s, A.symbolAdded({ symbol: 'SOLUSDT' }));
      expect(s.watchError).toBeNull();
    });

    it('removes the row and any pending marker when a symbol is removed', () => {
      const s = marketReducer(withRows(t('BTCUSDT'), t('ETHUSDT')), A.symbolRemoved({ symbol: 'BTCUSDT' }));
      expect(s.ids).toEqual(['ETHUSDT']);
    });

    it('drops a failed symbol from pending and records the reason', () => {
      let s = marketReducer(initial, A.symbolAdded({ symbol: 'FAKEUSDT' }));
      s = marketReducer(s, A.symbolFailed({ symbol: 'FAKEUSDT', reason: 'No market data' }));
      expect(s.pending).toEqual([]);
      expect(s.watchError).toBe('No market data');
    });
  });
});
