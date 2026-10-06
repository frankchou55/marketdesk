import { createAction, props } from '@ngrx/store';
import { Ticker } from '../../shared/models/ticker.model';

export const loadMockTickers = createAction(
  '[Market] Load Mock Tickers'
);

export const tickersLoaded = createAction(
  '[Market] Tickers Loaded',
  props<{ tickers: Ticker[] }>()
);

export const symbolAdded = createAction(
  '[Market] Symbol Added',
  props<{ symbol: string }>()
);

export const symbolRemoved = createAction(
  '[Market] Symbol Removed',
  props<{ symbol: string }>()
);

export const ticksReceived = createAction(
  '[Market] Ticks Received',
  props<{ batch: Ticker[] }>()
);
