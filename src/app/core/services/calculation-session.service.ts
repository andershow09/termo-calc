import { Injectable } from '@angular/core';

import { InputCalc, ResultCalc } from '../../shared/models/fluxo-ar.model';

@Injectable({ providedIn: 'root' })
export class CalculationSessionService {
  private input: InputCalc | null = null;
  private result: ResultCalc | null = null;

  save(input: InputCalc, result: ResultCalc): void {
    this.input = { ...input };
    this.result = { ...result };
  }

  getInput(): InputCalc | null {
    return this.input ? { ...this.input } : null;
  }

  getResult(): ResultCalc | null {
    return this.result ? { ...this.result } : null;
  }

  clear(): void {
    this.input = null;
    this.result = null;
  }
}
