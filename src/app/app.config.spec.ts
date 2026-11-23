import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { appConfig } from './app.config';
import { DashboardApi } from './core/dashboard/dashboard-api';
import { AuthoritiesDashboard } from './features/authorities/pages/authorities-dashboard/authorities-dashboard';
import { AuthorityPage } from './features/authorities/pages/authority-page/authority-page';

describe('appConfig routes', () => {
  const authority = {
    id: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
    name: 'European Banking Authority',
    jurisdiction: 'EU',
    enabled: true,
    createdAt: '2026-10-01T10:15:30Z',
    createdBy: 'admin-console',
    frameworks: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        { provide: DashboardApi, useValue: { get: () => of({ authorities: [authority], controlGroups: [], ungroupedControls: [] }) } },
      ],
    });
  });

  it('opens the authorities dashboard from the home page', async () => {
    const harness = await RouterTestingHarness.create();

    expect(await harness.navigateByUrl('/', AuthoritiesDashboard)).toBeInstanceOf(AuthoritiesDashboard);
  });

  it('opens the authority page with the id from the URL', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(`/authorities/${authority.id}`, AuthorityPage);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe('European Banking Authority');
  });
});
