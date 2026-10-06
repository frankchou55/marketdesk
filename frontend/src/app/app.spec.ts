import { TestBed } from '@angular/core/testing';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AppComponent } from './app';
import { provideMockStore } from '@ngrx/store/testing';

// main.ts registers these at runtime; tests bootstrap components directly, so register here too.
ModuleRegistry.registerModules([AllCommunityModule]);

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideMockStore({
          initialState: {
            market: {
              ids: [],
              entities: {},
              loading: false,
              error: null,
              connection: 'live',
              connectionMessage: 'Connected',
              pending: [],
              watchError: null,
            },
          },
        }),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have title 'Market Desk'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Market Desk');
  });
});
