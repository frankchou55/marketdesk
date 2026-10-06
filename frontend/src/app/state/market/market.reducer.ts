import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Ticker } from '../../shared/models/ticker.model';
import * as MarketActions from './market.actions';

export interface MarketState extends EntityState<Ticker> {
  loading: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<Ticker> = createEntityAdapter<Ticker>({
  selectId: (ticker: Ticker) => ticker.symbol,
});

const initialState: MarketState = adapter.getInitialState({
  loading: false,
  error: null,
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
  on(MarketActions.ticksReceived, (state, { batch }) =>
    adapter.upsertMany(batch, state)
  )
);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
