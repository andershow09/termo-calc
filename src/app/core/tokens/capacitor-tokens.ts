import { InjectionToken } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Geolocation } from '@capacitor/geolocation';

export const APP_PREFERENCES = new InjectionToken<typeof Preferences>(
  'App Preferences',
  {
    providedIn: 'root',
    factory: () => Preferences,
  },
);

export const APP_GEOLOCATION = new InjectionToken<typeof Geolocation>(
  'App Geolocation',
  {
    providedIn: 'root',
    factory: () => Geolocation,
  },
);

export const APP_FETCH = new InjectionToken<typeof fetch>('App Fetch', {
  providedIn: 'root',
  factory: () => fetch.bind(globalThis),
});
