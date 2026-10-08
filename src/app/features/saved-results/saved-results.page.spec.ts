import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SavedResultsPage } from './saved-results.page';
import { LocalDataService } from '../../core/services/local-data.service';
import { CalculationSessionService } from '../../core/services/calculation-session.service';
import { SavedCalculation } from '../../shared/models/saved-calculation.model';
import { DEFAULT_INPUT_CALC } from '../../shared/models/fluxo-ar.model';

describe('SavedResultsPage', () => {
  let component: SavedResultsPage;
  let fixture: ComponentFixture<SavedResultsPage>;
  let router: Router;
  let localData: jasmine.SpyObj<LocalDataService>;
  let session: jasmine.SpyObj<CalculationSessionService>;

  const mockSaved: SavedCalculation = {
    id: 'calc-123',
    title: 'Câmara Teste',
    createdAt: new Date().toISOString(),
    ...DEFAULT_INPUT_CALC,
    areaAbertura: 9,
    entalpiaInfilt: 28,
    entalpiaRef: -13,
    densidadeInfilt: 1.2,
    densidadeRef: 1.3,
    fm: 0.97,
    fluxoCaloKcal: 30160,
    fluxoCalorKw: 35.08,
    consumo: 7.02,
    custoHora: 7.02,
    custoDia: 168.37,
    custoMes: 5051.09,
    custoAno: 60613.06,
  };

  beforeEach(async () => {
    localData = jasmine.createSpyObj<LocalDataService>('LocalDataService', [
      'getCalculations',
      'deleteCalculation',
    ]);
    localData.getCalculations.and.resolveTo([mockSaved]);

    session = jasmine.createSpyObj<CalculationSessionService>('CalculationSessionService', ['save']);

    await TestBed.configureTestingModule({
      imports: [SavedResultsPage],
      providers: [
        provideRouter([]),
        { provide: LocalDataService, useValue: localData },
        { provide: CalculationSessionService, useValue: session },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    fixture = TestBed.createComponent(SavedResultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load calculations', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    expect(localData.getCalculations).toHaveBeenCalled();
    expect(component.calculations.length).toBe(1);
  });

  it('should navigate back to /home on goBack()', () => {
    component.goBack();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('should open calculation and navigate to /results', () => {
    component.openCalculation(mockSaved);
    expect(session.save).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/results');
  });

  it('should delete calculation', async () => {
    localData.deleteCalculation.and.resolveTo();
    component.confirmDelete(mockSaved);
    expect(component.pendingDelete).toBe(mockSaved);
    expect(component.deleteAlertOpen).toBeTrue();

    await component.deletePending();
    expect(localData.deleteCalculation).toHaveBeenCalledWith('calc-123');
    expect(component.pendingDelete).toBeNull();
  });
});
