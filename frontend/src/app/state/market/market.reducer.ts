import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Ticker } from '../../shared/models/ticker.model';
import * as MarketActions from './market.actions';
import type { ConnectionState } from './market.actions';

export interface MarketState extends EntityState<Ticker> {
  loading: boolean;
  error: string | null;
  connection: ConnectionState;
  connectionMessage: string;
  pending: string[];
  watchError: string | null;
}

export const adapter: EntityAdapter<Ticker> = createEntityAdapter<Ticker>({
  selectId: (ticker: Ticker) => ticker.symbol,
});

const initialState: MarketState = adapter.getInitialState({
  loading: false,
  error: null,
  connection: 'offline',
  connectionMessage: 'Disconnected',
  pending: [],
  watchError: null,
});

export const marketReducer = createReducer(
  initialState,
  on(MarketActions.loadMockTickers, (state) => ({
    ...state,
    loading: true,
  })),
  on(MarketActions.tickersLoaded, (state, { tickers }) =>
    adapter.setAll(tickers, { ...state, loading: false })
  ),
  on(MarketActions.ticksReceived, (state, { batch }) => {
    const arrived = new Set(batch.map((t) => t.symbol));
    return adapter.upsertMany(batch, {
      ...state,
      pending: state.pending.filter((s) => !arrived.has(s)),
    });
  }),
  on(MarketActions.symbolAdded, (state, { symbol }) => {
    if (state.entities[symbol]) {
      return { ...state, watchError: `${symbol} is already on the watchlist` };
    }
    return {
      ...state,
      watchError: null,
      pending: state.pending.includes(symbol) ? state.pending : [...state.pending, symbol],
    };
  }),
  on(MarketActions.symbolRemoved, (state, { symbol }) =>
    adapter.removeOne(symbol, { ...state, pending: state.pending.filter((s) => s !== symbol) })
  ),
  on(MarketActions.symbolFailed, (state, { symbol, reason }) => ({
    ...state,
    pending: state.pending.filter((s) => s !== symbol),
    watchError: reason,
  })),
  on(MarketActions.connectionStatusChanged, (state, { state: connection, message }) => ({
    ...state,
    connection,
    connectionMessage: message,
  }))
);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
