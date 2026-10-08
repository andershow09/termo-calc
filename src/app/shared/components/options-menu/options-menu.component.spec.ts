/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { OptionsMenuComponent } from './options-menu.component';
import { EntitlementService } from '../../../core/services/entitlement.service';

describe('OptionsMenuComponent', () => {
  let component: OptionsMenuComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let entitlementSpy: jasmine.SpyObj<EntitlementService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    entitlementSpy = jasmine.createSpyObj('EntitlementService', [
      'unlocked',
      'premium',
    ]);
    Object.defineProperty(entitlementSpy, 'premium', {
      value: signal({ tier: 'free' }),
    });
    entitlementSpy.unlocked.and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: EntitlementService, useValue: entitlementSpy },
      ],
    });

    component = TestBed.runInInjectionContext(() => new OptionsMenuComponent());
  });

  it('creates with default items and closed popover state', () => {
    expect(component).toBeTruthy();
    expect(component.items.length).toBe(4);
    expect(component.isOpen).toBeFalse();
  });

  it('opens menu', () => {
    component.open();
    expect(component.isOpen).toBeTrue();
  });

  it('selects an item, closes menu, and navigates', async () => {
    await component.select('/settings');

    expect(component.isOpen).toBeFalse();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/settings');
  });

  it('reports premium status according to entitlement service', () => {
    expect(component.isPremium).toBeFalse();

    entitlementSpy.unlocked.and.returnValue(true);
    expect(component.isPremium).toBeTrue();
  });
});
