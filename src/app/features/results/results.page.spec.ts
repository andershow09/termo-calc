import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { ResultsPage } from './results.page';
import { CalculationSessionService } from '../../core/services/calculation-session.service';
import { LocalDataService } from '../../core/services/local-data.service';
import { EntitlementService } from '../../core/services/entitlement.service';
import { ReportAlreadyExistsError, ReportService } from '../../core/services/report.service';
import { CalculateFlowService } from '../../core/services/calculate-flow.service';
import {
  DEFAULT_INPUT_CALC,
  ResultCalc,
} from '../../shared/models/fluxo-ar.model';
import { RESULTS } from '../../core/i18n/messages';

describe('ResultsPage', () => {
  let page: ResultsPage;
  let reports: jasmine.SpyObj<ReportService>;
  let router: jasmine.SpyObj<Router>;
  let localData: jasmine.SpyObj<LocalDataService>;
  let entitlement: jasmine.SpyObj<EntitlementService>;
  let sessionResult: ResultCalc | null;

  beforeEach(() => {
    reports = jasmine.createSpyObj<ReportService>('ReportService', [
      'generate',
    ]);
    reports.generate.and.resolveTo({ fileName: 'report.pdf', shared: false });

    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    localData = jasmine.createSpyObj('LocalDataService', [
      'getPreferences',
      'getCalculations',
      'saveCalculation',
    ]);
    localData.getPreferences.and.resolveTo({ autoShare: true });
    localData.getCalculations.and.resolveTo([]);
    localData.saveCalculation.and.resolveTo({} as any);

    entitlement = jasmine.createSpyObj('EntitlementService', [
      'unlocked',
      'isPremium',
    ]);
    Object.defineProperty(entitlement, 'premium', {
      value: signal({ tier: 'premium' }),
    });
    entitlement.unlocked.and.returnValue(true);

    sessionResult = new CalculateFlowService().calculateFlow(
      DEFAULT_INPUT_CALC,
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: CalculationSessionService,
          useValue: {
            getInput: () => DEFAULT_INPUT_CALC,
            getResult: () => sessionResult,
          },
        },
        { provide: LocalDataService, useValue: localData },
        { provide: EntitlementService, useValue: entitlement },
        { provide: ReportService, useValue: reports },
      ],
    });
    page = TestBed.runInInjectionContext(() => new ResultsPage());
  });

  it('passes the responsible person and confirms generation after cancelled sharing', async () => {
    const confirm = page.reportAlertButtons[1];
    await confirm.handler?.({ title: 'Câmara', responsavel: ' Eng. Ana ' });
    expect(reports.generate).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Câmara' }),
      { share: true, responsavel: 'Eng. Ana' },
    );
    expect(page.infoMessage).toBe(RESULTS.reportGenerated);
    expect(page.errorMessageVisible).toBeFalse();
    expect(page.generatingReport).toBeFalse();
  });

  it('explains duplicate titles and allows retrying after failure', async () => {
    reports.generate.and.rejectWith(new ReportAlreadyExistsError());
    await page.generateReport('Câmara');
    expect(page.errorMessage).toContain('Escolha outro título');
    expect(page.generatingReport).toBeFalse();
  });

  it('saves calculation successfully', async () => {
    await page.save('Minha câmara');

    expect(localData.saveCalculation).toHaveBeenCalledWith(
      'Minha câmara',
      jasmine.any(Object),
      jasmine.any(Object),
    );
    expect(page.savedMessageVisible).toBeTrue();
    expect(page.saveAlertOpen).toBeFalse();
  });

  it('opens save dialog directly (portfolio always unlocked)', async () => {
    localData.getCalculations.and.resolveTo([]);

    await page.openSaveDialog();

    expect(page.saveAlertOpen).toBeTrue();
  });

  it('opens report dialog directly (portfolio always premium)', () => {
    entitlement.unlocked.and.returnValue(true);

    page.requestReport();

    expect(page.reportAlertOpen).toBeTrue();
  });

  it('navigates to settings on goPremium', () => {
    page.goPremium();

    expect(page.paywallAlertOpen).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/settings');
  });

  it('navigates back to home on edit', () => {
    page.edit();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });
});
