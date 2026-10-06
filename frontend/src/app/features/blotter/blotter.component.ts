import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellStyle } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Ticker } from '../../shared/models/ticker.model';
import { selectAllTickers, selectMarketLoading } from '../../state/market/market.selectors';
import { loadMockTickers } from '../../state/market/market.actions';

@Component({
  selector: 'app-blotter',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  template: `
    <div class="blotter-container">
      <h2>Market Blotter</h2>
      <ag-grid-angular
        class="ag-theme-quartz"
        [rowData]="tickers$ | async"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [rowSelection]="'single'"
        (gridReady)="onGridReady($event)"
      />
    </div>
  `,
  styles: [`
    .blotter-container {
      height: calc(100vh - 80px);
      padding: 16px;
    }

    h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
    }

    ag-grid-angular {
      width: 100%;
      height: 100%;
    }

    :host ::ng-deep .ag-theme-quartz {
      --ag-row-hover-color: #f0f0f0;
      --ag-selected-row-background-color: #e6f0ff;
    }
  `],
})
export class BlotterComponent implements OnInit {
  tickers$: Observable<Ticker[]>;
  loading$: Observable<boolean>;

  columnDefs: ColDef<Ticker>[] = [
    { field: 'symbol', headerName: 'Symbol', width: 100, pinned: 'left' },
    { field: 'price', headerName: 'Price', width: 120 },
    { field: 'change', headerName: 'Change', width: 100 },
    {
      field: 'changePercent',
      headerName: 'Change %',
      width: 120,
      cellStyle: (params: { value: number }): CellStyle => ({
        color: params.value >= 0 ? '#22863a' : '#cb2431',
        fontWeight: 'bold',
      }),
    },
    { field: 'bid', headerName: 'Bid', width: 120 },
    { field: 'ask', headerName: 'Ask', width: 120 },
    { field: 'volume', headerName: 'Volume', width: 140 },
  ];

  defaultColDef: ColDef<Ticker> = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  constructor(private store: Store<{ market: object }>) {
    this.tickers$ = this.store.select(selectAllTickers);
    this.loading$ = this.store.select(selectMarketLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(loadMockTickers());
  }

  onGridReady(params: GridReadyEvent<Ticker>): void {
    params.api.sizeColumnsToFit();
  }
}
