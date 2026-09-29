import { Routes } from '@angular/router';

export const musicRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dj/dj-login/dj-login.component').then((m) => m.DjLoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dj/dj-dashboard/dj-dashboard.component').then((m) => m.DjDashboardComponent),
  },
  {
    path: ':code',
    loadComponent: () =>
      import('./dj/dj-panel/dj-panel.component').then((m) => m.DjPanelComponent),
  },
];
