import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectConnection } from './state/market/market.selectors';
import { BlotterComponent } from './features/blotter/blotter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, BlotterComponent],
  template: `
    <div class="app">
      <header class="header">
        <div class="brand">
          <span class="logo">MD</span>
          <div>
            <h1>Market Desk</h1>
            <p>Live crypto market blotter</p>
          </div>
        </div>
        @if (connection$ | async; as conn) {
          <div class="status" [attr.data-state]="conn.state">
            <span class="dot"></span>
            <span>{{ conn.state === 'live' ? 'Live' : conn.message }}</span>
          </div>
        }
      </header>
      <main>
        <app-blotter />
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    .app {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }

    .brand { display: flex; align-items: center; gap: 12px; }

    .logo {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), #7a5cff);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #fff;
    }

    h1 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.2px; }
    p { margin: 2px 0 0; font-size: 12px; color: var(--text-dim); }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-dim);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-dim);
    }

    .status[data-state='live'] { color: var(--up); }
    .status[data-state='live'] .dot { background: var(--up); animation: pulse 2s infinite; }
    .status[data-state='connecting'] .dot,
    .status[data-state='reconnecting'] .dot { background: #f5a524; }
    .status[data-state='offline'] .dot { background: var(--down); }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(38, 194, 129, 0.5); }
      50% { box-shadow: 0 0 0 5px rgba(38, 194, 129, 0); }
    }

    main {
      flex: 1;
      min-height: 0;
      padding: 16px 20px 20px;
    }
  `],
})
export class AppComponent {
  connection$ = inject(Store).select(selectConnection);
}
