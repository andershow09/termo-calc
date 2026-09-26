import { TestBed } from '@angular/core/testing';
import { DeviceLocationService } from './device-location.service';

describe('DeviceLocationService', () => {
  let service: DeviceLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns success with default altitude', async () => {
    const outcome = await service.getAltitude();
    expect(outcome.status).toBe('success');
    if (outcome.status === 'success') {
      expect(outcome.altitude).toBe(100);
    }
  });
});
