import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ResultsPage } from './results.page';
import { CalculationSessionService } from '../../core/services/calculation-session.service';
import { LocalDataService } from '../../core/services/local-data.service';
import { EntitlementService } from '../../core/services/entitlement.service';
import { ReportAlreadyExistsError, ReportService } from '../../core/services/report.service';
import { CalculateFlowService } from '../../core/services/calculate-flow.service';
import { DEFAULT_INPUT_CALC } from '../../shared/models/fluxo-ar.model';
import { RESULTS } from '../../core/i18n/messages';

describe('ResultsPage report feedback', () => {
  let page: ResultsPage;
  let reports: jasmine.SpyObj<ReportService>;

  beforeEach(() => {
    reports = jasmine.createSpyObj<ReportService>('ReportService', ['generate']);
    reports.generate.and.resolveTo({ fileName: 'report.pdf', shared: false });
    TestBed.configureTestingModule({ providers: [
      { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) },
      { provide: CalculationSessionService, useValue: {
        getInput: () => DEFAULT_INPUT_CALC,
        getResult: () => new CalculateFlowService().calculateFlow(DEFAULT_INPUT_CALC),
      } },
      { provide: LocalDataService, useValue: { getPreferences: async () => ({ autoShare: true }) } },
      { provide: EntitlementService, useValue: { unlocked: () => true, premium: () => true } },
      { provide: ReportService, useValue: reports },
    ] });
    page = TestBed.runInInjectionContext(() => new ResultsPage());
  });

  it('passes the responsible person and confirms generation after cancelled sharing', async () => {
    const confirm = page.reportAlertButtons[1];
    await confirm.handler?.({ title: 'Câmara', responsavel: ' Eng. Ana ' });
    expect(reports.generate).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Câmara' }), {
      share: true, responsavel: 'Eng. Ana',
    });
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
});
