/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { SettingsPage } from './settings.page';
import { LocalDataService } from '../../core/services/local-data.service';
import { EntitlementService } from '../../core/services/entitlement.service';
import { PREMIUM } from '../../core/i18n/messages';

describe('SettingsPage', () => {
  let page: SettingsPage;
  let dataSpy: jasmine.SpyObj<LocalDataService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let entitlementSpy: jasmine.SpyObj<EntitlementService>;

  beforeEach(async () => {
    dataSpy = jasmine.createSpyObj('LocalDataService', ['getPreferences', 'savePreferences']);
    dataSpy.getPreferences.and.resolveTo({ autoShare: true });
    dataSpy.savePreferences.and.resolveTo();

    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    entitlementSpy = jasmine.createSpyObj('EntitlementService', [
      'getProduct',
      'unlocked',
      'purchase',
      'restore',
    ]);
    Object.defineProperty(entitlementSpy, 'premium', {
      value: signal({ tier: 'free' }),
    });
    Object.defineProperty(entitlementSpy, 'monetizationEnabled', {
      value: true,
    });
    entitlementSpy.getProduct.and.returnValue({
      id: 'termocalc_premium',
      title: 'Premium',
      description: 'Desc',
      price: 'R$ 19,90',
    });
    entitlementSpy.unlocked.and.returnValue(false);
    entitlementSpy.purchase.and.resolveTo({ tier: 'premium' });
    entitlementSpy.restore.and.resolveTo({ tier: 'premium' });

    TestBed.configureTestingModule({
      providers: [
        { provide: LocalDataService, useValue: dataSpy },
        { provide: Router, useValue: routerSpy },
        { provide: EntitlementService, useValue: entitlementSpy },
      ],
    });

    page = TestBed.runInInjectionContext(() => new SettingsPage());
    await page.loadPreferences();
  });

  it('loads preferences on init', async () => {
    await page.loadPreferences();
    expect(dataSpy.getPreferences).toHaveBeenCalled();
    expect(page.autoShare).toBeTrue();
  });

  it('updates autoShare preference and saves', async () => {
    const event = { detail: { checked: false } } as unknown as CustomEvent;
    await page.updateAutoShare(event);

    expect(page.autoShare).toBeFalse();
    expect(dataSpy.savePreferences).toHaveBeenCalledWith({ autoShare: false });
    expect(page.savedMessageVisible).toBeTrue();
  });

  it('navigates to /home on goBack()', () => {
    page.goBack();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('reports premium status from entitlement service', () => {
    expect(page.isPremium).toBeFalse();

    entitlementSpy.unlocked.and.returnValue(true);
    expect(page.isPremium).toBeTrue();
  });

  it('subscribes successfully and shows info message', async () => {
    await page.subscribe();

    expect(entitlementSpy.purchase).toHaveBeenCalled();
    expect(page.infoMessage).toBe(PREMIUM.subscribeSuccess);
    expect(page.infoMessageVisible).toBeTrue();
    expect(page.processing).toBeFalse();
  });

  it('restores purchases and shows info message', async () => {
    await page.restore();

    expect(entitlementSpy.restore).toHaveBeenCalled();
    expect(page.infoMessage).toBe(PREMIUM.restoreSuccess);
    expect(page.infoMessageVisible).toBeTrue();
    expect(page.processing).toBeFalse();
  });
});
