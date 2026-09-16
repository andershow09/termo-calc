import { Injectable } from '@angular/core';
export type AltitudeOutcome =
  | { status: 'success'; altitude: number }
  | { status: 'denied' }
  | { status: 'unavailable' };
@Injectable({ providedIn: 'root' })
export class DeviceLocationService {
  /** No real location is collected or sent to external services. */
  async getAltitude(): Promise<AltitudeOutcome> {
    return { status: 'success', altitude: 100 };
  }
}

