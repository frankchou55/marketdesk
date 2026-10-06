import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, ValueFormatterParams, themeQuartz } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { Ticker } from '../../shared/models/ticker.model';
import { selectAllTickers } from '../../state/market/market.selectors';
import { connectSocket } from '../../state/market/market.actions';

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
  imports: [AsyncPipe, AgGridAngular],
  template: `
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
    />
  `,
  styles: [`
    :host { display: block; height: 100%; }
    ag-grid-angular { display: block; width: 100%; height: 100%; }
  `],
})
export class BlotterComponent implements OnInit {
  private readonly store = inject(Store);

  readonly theme = desk;
  readonly tickers$ = this.store.select(selectAllTickers);

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
  ];

  ngOnInit(): void {
    this.store.dispatch(connectSocket());
  }
}
