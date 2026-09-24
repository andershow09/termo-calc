import { Injectable, inject } from '@angular/core';

import { InputCalc, ResultCalc } from '../../shared/models/fluxo-ar.model';
import {
  SavedCalculation,
  UserPreferences,
} from '../../shared/models/saved-calculation.model';
import { APP_PREFERENCES } from '../tokens/capacitor-tokens';

const SAVED_CALCULATIONS_KEY = 'termocalc-portfolio.saved-calculations';
const USER_PREFERENCES_KEY = 'termocalc-portfolio.user-preferences';
const DEFAULT_PREFERENCES: UserPreferences = { autoShare: true };

@Injectable({ providedIn: 'root' })
export class LocalDataService {
  private readonly preferences = inject(APP_PREFERENCES);

  async getCalculations(): Promise<SavedCalculation[]> {
    const stored = await this.preferences.get({ key: SAVED_CALCULATIONS_KEY });
    if (!stored.value) {
      return [];
    }

    try {
      return JSON.parse(stored.value) as SavedCalculation[];
    } catch {
      return [];
    }
  }

  async saveCalculation(
    title: string,
    input: InputCalc,
    result: ResultCalc,
  ): Promise<SavedCalculation> {
    const calculation: SavedCalculation = {
      ...input,
      ...result,
      id: crypto.randomUUID(),
      title: title.trim() || 'Cálculo sem título',
      createdAt: new Date().toISOString(),
    };
    const calculations = await this.getCalculations();
    await this.preferences.set({
      key: SAVED_CALCULATIONS_KEY,
      value: JSON.stringify([calculation, ...calculations]),
    });
    return calculation;
  }

  async deleteCalculation(id: string): Promise<void> {
    const calculations = await this.getCalculations();
    await this.preferences.set({
      key: SAVED_CALCULATIONS_KEY,
      value: JSON.stringify(calculations.filter((item) => item.id !== id)),
    });
  }

  async getCalculation(id: string): Promise<SavedCalculation | null> {
    const calculations = await this.getCalculations();
    return calculations.find((item) => item.id === id) ?? null;
  }

  async getPreferences(): Promise<UserPreferences> {
    const stored = await this.preferences.get({ key: USER_PREFERENCES_KEY });
    if (!stored.value) {
      return { ...DEFAULT_PREFERENCES };
    }

    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored.value) };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await this.preferences.set({
      key: USER_PREFERENCES_KEY,
      value: JSON.stringify(preferences),
    });
  }
}
