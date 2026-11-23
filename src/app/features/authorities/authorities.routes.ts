import { Routes } from '@angular/router';
import { AuthoritiesDashboard } from './pages/authorities-dashboard/authorities-dashboard';
import { AuthorityPage } from './pages/authority-page/authority-page';

export const authoritiesRoutes: Routes = [
  { path: '', component: AuthoritiesDashboard },
  { path: ':id', component: AuthorityPage },
];
