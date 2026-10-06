import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MarketState, selectAll } from './market.reducer';

export const selectMarketState = createFeatureSelector<MarketState>('market');

export const selectAllTickers = createSelector(
  selectMarketState,
  selectAll
);

export const selectMarketLoading = createSelector(
  selectMarketState,
  (state: MarketState) => state.loading
);

export const selectMarketError = createSelector(
  selectMarketState,
  (state: MarketState) => state.error
);

export const selectConnection = createSelector(
  selectMarketState,
  (state: MarketState) => ({ state: state.connection, message: state.connectionMessage })
);

export const selectPending = createSelector(
  selectMarketState,
  (state: MarketState) => state.pending
);

export const selectWatchError = createSelector(
  selectMarketState,
  (state: MarketState) => state.watchError
);
