import { TestBed } from '@angular/core/testing';
import { CalculationSessionService } from './calculation-session.service';
import { DEFAULT_INPUT_CALC, ResultCalc } from '../../shared/models/fluxo-ar.model';

describe('CalculationSessionService', () => {
  let service: CalculationSessionService;

  const mockResult: ResultCalc = {
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

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationSessionService);
  });

  it('should be created with null input and result', () => {
    expect(service).toBeTruthy();
    expect(service.getInput()).toBeNull();
    expect(service.getResult()).toBeNull();
  });

  it('should save and retrieve copies of input and result', () => {
    service.save(DEFAULT_INPUT_CALC, mockResult);

    expect(service.getInput()).toEqual(DEFAULT_INPUT_CALC);
    expect(service.getResult()).toEqual(mockResult);

    // Ensure copies are returned
    const inputCopy = service.getInput();
    if (inputCopy) {
      inputCopy.temperaturaInf = 999;
    }
    expect(service.getInput()?.temperaturaInf).toBe(DEFAULT_INPUT_CALC.temperaturaInf);
  });

  it('should clear stored input and result', () => {
    service.save(DEFAULT_INPUT_CALC, mockResult);
    service.clear();

    expect(service.getInput()).toBeNull();
    expect(service.getResult()).toBeNull();
  });
});
