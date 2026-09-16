import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./features/results/results.page').then((m) => m.ResultsPage),
  },
  {
    path: 'saved-results',
    loadComponent: () =>
      import('./features/saved-results/saved-results.page').then(
        (m) => m.SavedResultsPage,
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/reports.page').then((m) => m.ReportsPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
