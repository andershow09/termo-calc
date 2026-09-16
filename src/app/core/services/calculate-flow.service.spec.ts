import { DEFAULT_INPUT_CALC } from '../../shared/models/fluxo-ar.model';
import { CalculateFlowService, DEMO_RESULT } from './calculate-flow.service';

describe('Portfolio calculation fixture', () => {
  it('does not derive results from the supplied engineering inputs', () => {
    const service = new CalculateFlowService();
    expect(service.calculateFlow(DEFAULT_INPUT_CALC)).toEqual(DEMO_RESULT);
    expect(service.calculateFlow({ ...DEFAULT_INPUT_CALC, temperaturaInf: 80, altitude: 900, cop: 1 }))
      .toEqual(DEMO_RESULT);
  });
  it('isolates results from mutations in consumers', () => {
    const service = new CalculateFlowService();
    service.calculateFlow(DEFAULT_INPUT_CALC).fluxoCalorKw = 999;
    expect(service.calculateFlow(DEFAULT_INPUT_CALC)).toEqual(DEMO_RESULT);
  });
});

