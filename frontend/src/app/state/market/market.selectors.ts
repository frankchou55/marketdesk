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
