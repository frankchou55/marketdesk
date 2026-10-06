import { TestBed } from '@angular/core/testing';
import { MarketSocketService, EMPTY_WATCHLIST_MESSAGE } from './market-socket.service';

const KEY = 'marketdesk.watchlist.v1';
const stored = (): string[] => JSON.parse(localStorage.getItem(KEY) ?? '[]');
const create = () => {
  TestBed.resetTestingModule();
  return TestBed.inject(MarketSocketService);
};

describe('MarketSocketService watchlist', () => {
  beforeEach(() => localStorage.clear());

  it('persists subscribed symbols and restores them in a new instance', () => {
    const svc = create();
    svc.subscribeToSymbol('PEPEUSDT');
    expect(stored()).toContain('PEPEUSDT');

    create(); // simulates a page reload
    expect(stored()).toContain('PEPEUSDT');
  });

  it('forgets unsubscribed symbols', () => {
    const svc = create();
    svc.unsubscribeFromSymbol('BTCUSDT');
    expect(stored()).not.toContain('BTCUSDT');
  });

  it('falls back to defaults when stored data is corrupt', () => {
    localStorage.setItem(KEY, '{not json');
    const svc = create();
    svc.subscribeToSymbol('PEPEUSDT'); // triggers a save of the in-memory list
    expect(stored().length).toBeGreaterThan(5);
  });

  it('reports an empty watchlist instead of opening a socket', () => {
    localStorage.setItem(KEY, JSON.stringify(['BTCUSDT']));
    const svc = create();
    let latest = '';
    svc.connection$.subscribe((c) => (latest = c.message));
    svc.unsubscribeFromSymbol('BTCUSDT');
    expect(latest).toBe(EMPTY_WATCHLIST_MESSAGE);
  });
});
