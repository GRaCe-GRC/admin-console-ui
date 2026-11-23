import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { DashboardApi } from './dashboard-api';

describe('DashboardApi', () => {
  let api: DashboardApi;
  let http: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(DashboardApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the whole dashboard in one call', () => {
    let result: Dashboard | undefined;
    api.get().subscribe((value) => (result = value));

    const request = http.expectOne('/api/dashboard');
    expect(request.request.method).toBe('GET');
    request.flush(dashboard);

    expect(result).toEqual(dashboard);
  });

  it('passes errors to the caller', () => {
    let status: number | undefined;
    api.get().subscribe({ error: (error) => (status = error.status) });

    http.expectOne('/api/dashboard').flush(null, { status: 502, statusText: 'Bad Gateway' });

    expect(status).toBe(502);
  });
});
