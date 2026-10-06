import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GetRowIdParams, ValueFormatterParams, themeQuartz } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { EMPTY_WATCHLIST_MESSAGE } from '../../core/market-socket.service';
import { Ticker } from '../../shared/models/ticker.model';
import { selectAllTickers, selectConnection, selectPending, selectWatchError } from '../../state/market/market.selectors';
import { connectSocket, retryConnection, symbolAdded, symbolRemoved } from '../../state/market/market.actions';

const UP = '#26c281';
const DOWN = '#f0556a';

/** Decimals scale with magnitude so $60,000 BTC and $0.00001 SHIB both read well. */
function priceDigits(v: number): number {
  const a = Math.abs(v);
  return a >= 1000 ? 2 : a >= 1 ? 4 : a >= 0.01 ? 5 : 8;
}

const formatPrice = (p: ValueFormatterParams<Ticker, number>): string =>
  p.value == null ? '' : p.value.toLocaleString('en-US', { minimumFractionDigits: priceDigits(p.value), maximumFractionDigits: priceDigits(p.value) });

const formatSigned = (p: ValueFormatterParams<Ticker, number>): string => {
  if (p.value == null) return '';
  const d = priceDigits(p.value);
  const s = Math.abs(p.value).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${p.value >= 0 ? '+' : '-'}${s}`;
};

const formatPercent = (p: ValueFormatterParams<Ticker, number>): string =>
  p.value == null ? '' : `${p.value >= 0 ? '+' : '-'}${Math.abs(p.value).toFixed(2)}%`;

const formatVolume = (p: ValueFormatterParams<Ticker, number>): string =>
  p.value == null ? '' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(p.value);

const changeColor = (p: { value: number | null }) =>
  p.value == null ? null : { color: p.value >= 0 ? UP : DOWN, fontWeight: 600 };

const desk = themeQuartz.withParams({
  backgroundColor: '#11151d',
  foregroundColor: '#e6e9ef',
  chromeBackgroundColor: '#161b26',
  headerBackgroundColor: '#161b26',
  headerTextColor: '#8a93a6',
  headerFontWeight: 600,
  borderColor: '#232a38',
  rowHoverColor: '#1b2230',
  oddRowBackgroundColor: '#0f131b',
  accentColor: '#4c8dff',
  inputBackgroundColor: '#0b0e14',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 13,
  rowHeight: 40,
  headerHeight: 42,
  wrapperBorderRadius: 10,
  valueChangeValueHighlightBackgroundColor: 'rgba(76, 141, 255, 0.35)',
});

@Component({
  selector: 'app-blotter',
  standalone: true,
  imports: [AsyncPipe, FormsModule, AgGridAngular],
  template: `
    <form class="toolbar" (ngSubmit)="addSymbol()">
      <input
        name="symbol"
        [(ngModel)]="symbolInput"
        placeholder="Add symbol (e.g. SOL or SOLUSDT)"
        autocomplete="off"
        spellcheck="false"
        maxlength="15"
      />
      <button type="submit" [disabled]="!symbolInput.trim()">Add</button>
      @if (inputError) {
        <span class="msg error">{{ inputError }}</span>
      } @else if (watchError$ | async; as err) {
        <span class="msg error">{{ err }}</span>
      } @else if (pending$ | async; as pending) {
        @if (pending.length) {
          <span class="msg">Waiting for data: {{ pending.join(', ') }}…</span>
        }
      }
    </form>
    <div class="grid-wrap" [class.stale]="(rowCount$ | async) && (connection$ | async)?.state !== 'live'">
    <ag-grid-angular
      [theme]="theme"
      [rowData]="tickers$ | async"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [getRowId]="getRowId"
      [pagination]="true"
      [paginationPageSize]="10"
      [paginationPageSizeSelector]="[10, 15, 25, 50]"
      [animateRows]="false"
      (cellClicked)="onCellClicked($event)"
    />
    @if (connection$ | async; as conn) {
      @if (rowCount$ | async) {
        @if (conn.state !== 'live') {
          <div class="banner">
            @if (conn.state === 'offline') { Feed offline — prices are stale. }
            @else { Reconnecting — prices are stale… }
            @if (conn.state === 'offline') { <button type="button" (click)="retry()">Retry</button> }
          </div>
        }
      } @else {
        <div class="empty">
          @if (conn.state === 'offline') {
            <strong>{{ conn.message === emptyMessage ? 'Your watchlist is empty' : "Can't reach the market feed" }}</strong>
            <span>{{ conn.message === emptyMessage ? 'Add a symbol above to start streaming.' : conn.message }}</span>
            @if (conn.message !== emptyMessage) { <button type="button" (click)="retry()">Retry</button> }
          } @else if (conn.state === 'live') {
            <strong>Waiting for first prices…</strong>
          } @else {
            <strong>{{ conn.state === 'reconnecting' ? 'Reconnecting…' : 'Connecting to Binance…' }}</strong>
          }
        </div>
      }
    }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 12px; height: 100%; }
    .grid-wrap { position: relative; flex: 1; min-height: 0; }
    ag-grid-angular { display: block; width: 100%; height: 100%; transition: opacity 0.2s; }
    .grid-wrap.stale ag-grid-angular { opacity: 0.55; }

    .banner {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 14px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      color: #f5a524;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    .banner button { padding: 4px 12px; }

    .empty {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 80px;
      color: var(--text-dim);
      font-size: 13px;
      pointer-events: none;
    }
    .empty strong { color: var(--text); font-size: 15px; }
    .empty button { pointer-events: auto; margin-top: 4px; }

    .toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    input {
      width: 260px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      font: inherit;
      font-size: 13px;
      outline: none;
    }
    input:focus { border-color: var(--accent); }

    button {
      padding: 8px 16px;
      border: 0;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled { opacity: 0.4; cursor: default; }

    .msg { font-size: 12px; color: var(--text-dim); }
    .msg.error { color: var(--down); }
  `],
})
export class BlotterComponent implements OnInit {
  private readonly store = inject(Store);

  readonly theme = desk;
  readonly tickers$ = this.store.select(selectAllTickers);
  readonly connection$ = this.store.select(selectConnection);
  readonly rowCount$ = this.tickers$.pipe(map((rows) => rows.length));
  readonly emptyMessage = EMPTY_WATCHLIST_MESSAGE;
  readonly pending$ = this.store.select(selectPending);
  readonly watchError$ = this.store.select(selectWatchError);

  symbolInput = '';
  inputError = '';

  readonly getRowId = (params: GetRowIdParams<Ticker>): string => params.data.symbol;

  readonly defaultColDef: ColDef<Ticker> = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
    minWidth: 110,
    flex: 1,
  };

  readonly columnDefs: ColDef<Ticker>[] = [
    {
      field: 'symbol',
      headerName: 'Symbol',
      pinned: 'left',
      sort: 'asc',
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: 600 },
    },
    { field: 'price', headerName: 'Price', type: 'rightAligned', filter: 'agNumberColumnFilter', valueFormatter: formatPrice, enableCellChangeFlash: true },
    { field: 'change', headerName: 'Change', type: 'rightAligned', filter: 'agNumberColumnFilter', valueFormatter: formatSigned, cellStyle: changeColor },
    { field: 'changePercent', headerName: 'Change %', type: 'rightAligned', filter: 'agNumberColumnFilter', valueFormatter: formatPercent, cellStyle: changeColor },
    { field: 'bid', headerName: 'Bid', type: 'rightAligned', filter: 'agNumberColumnFilter', valueFormatter: formatPrice, enableCellChangeFlash: true },
    { field: 'ask', headerName: 'Ask', type: 'rightAligned', filter: 'agNumberColumnFilter', valueFormatter: formatPrice, enableCellChangeFlash: true },
    { field: 'volume', headerName: '24h Volume', type: 'rightAligned', filter: 'agNumberColumnFilter', valueFormatter: formatVolume },
    {
      colId: 'remove',
      headerName: '',
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      flex: 0,
      pinned: 'right',
      sortable: false,
      filter: false,
      floatingFilter: false,
      resizable: false,
      suppressMovable: true,
      cellStyle: { cursor: 'pointer', color: '#8a93a6', textAlign: 'center', fontSize: '16px' },
      valueGetter: () => '✕',
      tooltip: () => 'Remove from watchlist',
    },
  ];

  retry(): void {
    this.store.dispatch(retryConnection());
  }

  addSymbol(): void {
    let symbol = this.symbolInput.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,15}$/.test(symbol)) {
      this.inputError = 'Use letters and numbers only, e.g. SOL or SOLUSDT';
      return;
    }
    // Bare tickers like "SOL" default to the USDT pair, matching the rest of the watchlist.
    if (!/(USDT|USDC|USD|BTC|ETH|BNB)$/.test(symbol) || symbol.length <= 4) symbol += 'USDT';
    this.inputError = '';
    this.symbolInput = '';
    this.store.dispatch(symbolAdded({ symbol }));
  }

  onCellClicked(e: CellClickedEvent<Ticker>): void {
    if (e.colDef.colId === 'remove' && e.data) {
      this.store.dispatch(symbolRemoved({ symbol: e.data.symbol }));
    }
  }

  ngOnInit(): void {
    this.store.dispatch(connectSocket());
  }
}
