import { Injectable } from '@angular/core';
import { InputCalc, ResultCalc } from '../../shared/models/fluxo-ar.model';

/** Synthetic UI fixture. Values are fixed and have no engineering meaning. */
export const DEMO_RESULT: Readonly<ResultCalc> = Object.freeze({
  areaAbertura: 8, entalpiaInfilt: 20, entalpiaRef: -10,
  densidadeInfilt: 1.1, densidadeRef: 1.2, fm: 0.8,
  fluxoCaloKcal: 1000, fluxoCalorKw: 12, consumo: 3,
  custoHora: 4, custoDia: 90, custoMes: 2500, custoAno: 30000,
});

@Injectable({ providedIn: 'root' })
export class CalculateFlowService {
  calculateFlow(input: InputCalc): ResultCalc {
    // Keep the interface to demonstrate form/service/page integration.
    void input;
    return { ...DEMO_RESULT };
  }
}
