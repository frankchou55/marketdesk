import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlotterComponent } from './features/blotter/blotter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BlotterComponent],
  template: `
    <div class="app">
      <header class="header">
        <h1>Market Desk</h1>
        <div class="connection-status">
          <span class="status-indicator live"></span>
          <span>Live</span>
        </div>
      </header>
      <main>
        <app-blotter />
      </main>
    </div>
  `,
  styles: [`
    .app {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #fafbfc;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background-color: #ffffff;
      border-bottom: 1px solid #e1e4e8;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #24292e;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background-color: #f6f8fa;
      border-radius: 6px;
      font-size: 14px;
      color: #586069;
    }

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #ccc;

      &.live {
        background-color: #22863a;
        animation: pulse 2s infinite;
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    main {
      flex: 1;
      overflow: hidden;
    }
  `],
})
export class AppComponent {}
