import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { DashboardApi } from './dashboard-api';
import { DashboardStore } from './dashboard-store';

describe('DashboardStore', () => {
  const dashboard: Dashboard = {
    authorities: [
      {
        id: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
        name: 'EBA',
        jurisdiction: 'EU',
        enabled: true,
        createdAt: '2026-10-01T10:15:30Z',
        createdBy: 'admin-console',
        frameworks: [],
      },
    ],
    controlGroups: [],
    ungroupedControls: [],
  };

  let get: ReturnType<typeof vi.fn<() => Observable<Dashboard>>>;
  let store: DashboardStore;

  beforeEach(() => {
    get = vi.fn<() => Observable<Dashboard>>(() => of(dashboard));
    TestBed.configureTestingModule({
      providers: [{ provide: DashboardApi, useValue: { get } }],
    });
    store = TestBed.inject(DashboardStore);
  });

  it('starts empty', () => {
    expect(store.dashboard()).toBeNull();
    expect(store.authorities()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.loadFailed()).toBe(false);
  });

  it('loads the dashboard and exposes its authorities', () => {
    store.load();

    expect(get).toHaveBeenCalledTimes(1);
    expect(store.dashboard()).toEqual(dashboard);
    expect(store.authorities()).toEqual(dashboard.authorities);
    expect(store.loading()).toBe(false);
  });

  it('loads only once', () => {
    store.load();
    store.load();

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('does not start a second load while one is running', () => {
    get.mockReturnValue(new Subject<Dashboard>());
    store.load();
    expect(store.loading()).toBe(true);

    store.load();

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('reloads every time it is asked to', () => {
    store.load();
    get.mockReturnValue(of({ ...dashboard, authorities: [] }));

    store.reload();

    expect(get).toHaveBeenCalledTimes(2);
    expect(store.authorities()).toEqual([]);
  });

  it('drops the answer of an earlier request when it reloads', () => {
    const first = new Subject<Dashboard>();
    get.mockReturnValueOnce(first);
    store.reload();
    store.reload();

    first.next({ ...dashboard, authorities: [] });

    expect(store.authorities()).toEqual(dashboard.authorities);
  });

  it('reports a failed load, keeps the earlier data and retries on the next load', () => {
    store.load();
    get.mockReturnValue(throwError(() => new Error('502')));

    store.reload();

    expect(store.loadFailed()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.dashboard()).toEqual(dashboard);

    get.mockReturnValue(of(dashboard));
    store.reload();
    expect(store.loadFailed()).toBe(false);
  });

  it('retries the first load after it failed', () => {
    get.mockReturnValueOnce(throwError(() => new Error('502')));
    store.load();
    expect(store.loadFailed()).toBe(true);

    store.load();

    expect(get).toHaveBeenCalledTimes(2);
    expect(store.dashboard()).toEqual(dashboard);
  });
});
