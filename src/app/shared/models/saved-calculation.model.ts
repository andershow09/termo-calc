import { InputCalc, ResultCalc } from './fluxo-ar.model';

export interface SavedCalculation extends InputCalc, ResultCalc {
  id: string;
  title: string;
  createdAt: string;
}

export interface UserPreferences {
  autoShare: boolean;
}
