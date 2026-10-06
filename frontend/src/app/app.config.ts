import { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { marketReducer } from './state/market/market.reducer';
import { MarketEffects } from './state/market/market.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideStore({
      market: marketReducer,
    }),
    provideEffects([MarketEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
  ],
};
