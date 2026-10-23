import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'authorities' },
  {
    path: 'authorities',
    loadChildren: () => import('./features/authorities/authorities.routes').then((m) => m.authoritiesRoutes),
  },
];
