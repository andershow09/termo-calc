import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ReportsPage } from './reports.page';
import { EntitlementService } from '../../core/services/entitlement.service';
import { ReportService, ReportFile } from '../../core/services/report.service';

describe('ReportsPage', () => {
  let component: ReportsPage;
  let fixture: ComponentFixture<ReportsPage>;
  let router: Router;
  let entitlement: jasmine.SpyObj<EntitlementService>;
  let reportService: jasmine.SpyObj<ReportService>;

  const mockFile: ReportFile = {
    name: 'relatorio-test.pdf',
    title: 'Relatório Teste',
    uri: 'file:///path/to/relatorio-test.pdf',
    size: 1024,
    modifiedAt: Date.now(),
  };

  beforeEach(async () => {
    entitlement = jasmine.createSpyObj<EntitlementService>('EntitlementService', ['unlocked', 'premium']);
    entitlement.unlocked.and.returnValue(true);

    reportService = jasmine.createSpyObj<ReportService>('ReportService', [
      'listReports',
      'shareReport',
      'openReport',
      'deleteReport',
    ]);
    reportService.listReports.and.resolveTo([mockFile]);

    await TestBed.configureTestingModule({
      imports: [ReportsPage],
      providers: [
        provideRouter([]),
        { provide: EntitlementService, useValue: entitlement },
        { provide: ReportService, useValue: reportService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    fixture = TestBed.createComponent(ReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load reports', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    expect(reportService.listReports).toHaveBeenCalled();
    expect(component.files.length).toBe(1);
  });

  it('should navigate back to /home on goBack()', () => {
    component.goBack();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('should open report file', async () => {
    reportService.openReport.and.resolveTo();
    await component.open(mockFile);
    expect(reportService.openReport).toHaveBeenCalledWith(mockFile);
  });
});
