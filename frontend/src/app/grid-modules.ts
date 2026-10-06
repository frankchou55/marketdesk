import { isDevMode } from '@angular/core';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  HighlightChangesModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  TextFilterModule,
  TooltipModule,
  ValidationModule,
} from 'ag-grid-community';

/**
 * Registers only the AG Grid Community features the blotter uses (instead of AllCommunityModule),
 * which keeps the bundle smaller. ValidationModule adds readable errors in dev builds only.
 * If you add a grid feature and see "AG Grid: error #200", add its module here.
 */
export function registerGridModules(): void {
  ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PaginationModule,
    TextFilterModule,
    NumberFilterModule,
    CellStyleModule,
    TooltipModule,
    HighlightChangesModule, // enableCellChangeFlash
    ...(isDevMode() ? [ValidationModule] : []),
  ]);
}
