/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { LocalDataService } from './local-data.service';
import { APP_PREFERENCES } from '../tokens/capacitor-tokens';
import {
  DEFAULT_INPUT_CALC,
  ResultCalc,
} from '../../shared/models/fluxo-ar.model';
import { SavedCalculation } from '../../shared/models/saved-calculation.model';

describe('LocalDataService', () => {
  let service: LocalDataService;
  let preferencesSpy: jasmine.SpyObj<{
    get: (options: { key: string }) => Promise<{ value: string | null }>;
    set: (options: { key: string; value: string }) => Promise<void>;
  }>;

  const mockResult: ResultCalc = {
    areaAbertura: 9,
    entalpiaInfilt: 40,
    entalpiaRef: 10,
    densidadeInfilt: 1.2,
    densidadeRef: 1.4,
    fm: 0.5,
    fluxoCaloKcal: 1000,
    fluxoCalorKw: 1.16,
    consumo: 0.23,
    custoHora: 0.23,
    custoDia: 5.52,
    custoMes: 165.6,
    custoAno: 1987.2,
  };

  const mockCalculation: SavedCalculation = {
    ...DEFAULT_INPUT_CALC,
    ...mockResult,
    id: 'calc-123',
    title: 'Câmara Teste',
    createdAt: '2026-09-23T12:00:00.000Z',
  };

  beforeEach(() => {
    preferencesSpy = jasmine.createSpyObj('Preferences', ['get', 'set']);
    preferencesSpy.get.and.resolveTo({ value: null });
    preferencesSpy.set.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        LocalDataService,
        { provide: APP_PREFERENCES, useValue: preferencesSpy },
      ],
    });
    service = TestBed.inject(LocalDataService);
  });

  describe('calculations persistence', () => {
    it('returns empty array when no calculations are stored', async () => {
      preferencesSpy.get.and.resolveTo({ value: null });
      const calculations = await service.getCalculations();
      expect(calculations).toEqual([]);
    });

    it('returns parsed calculations when valid JSON is stored', async () => {
      preferencesSpy.get.and.resolveTo({
        value: JSON.stringify([mockCalculation]),
      });
      const calculations = await service.getCalculations();
      expect(calculations.length).toBe(1);
      expect(calculations[0].id).toBe('calc-123');
      expect(calculations[0].title).toBe('Câmara Teste');
    });

    it('returns empty array when stored data is malformed JSON', async () => {
      preferencesSpy.get.and.resolveTo({ value: '{corrupt json' });
      const calculations = await service.getCalculations();
      expect(calculations).toEqual([]);
    });

    it('saves a new calculation with generated id and prepends it', async () => {
      preferencesSpy.get.and.resolveTo({
        value: JSON.stringify([mockCalculation]),
      });

      const saved = await service.saveCalculation(
        'Novo cálculo',
        DEFAULT_INPUT_CALC,
        mockResult,
      );

      expect(saved.title).toBe('Novo cálculo');
      expect(saved.id).toBeDefined();
      expect(saved.createdAt).toBeDefined();
      expect(preferencesSpy.set).toHaveBeenCalledTimes(1);

      const setCallArg = preferencesSpy.set.calls.mostRecent().args[0];
      const parsedList = JSON.parse(setCallArg.value) as SavedCalculation[];
      expect(parsedList.length).toBe(2);
      expect(parsedList[0].title).toBe('Novo cálculo');
      expect(parsedList[1].id).toBe('calc-123');
    });

    it('falls back to default title if title is empty or only whitespace', async () => {
      const saved = await service.saveCalculation(
        '   ',
        DEFAULT_INPUT_CALC,
        mockResult,
      );
      expect(saved.title).toBe('Cálculo sem título');
    });

    it('finds a calculation by id or returns null if not found', async () => {
      preferencesSpy.get.and.resolveTo({
        value: JSON.stringify([mockCalculation]),
      });

      const found = await service.getCalculation('calc-123');
      const notFound = await service.getCalculation('non-existent');

      expect(found).toEqual(mockCalculation);
      expect(notFound).toBeNull();
    });

    it('deletes a calculation by id and updates storage', async () => {
      preferencesSpy.get.and.resolveTo({
        value: JSON.stringify([mockCalculation]),
      });

      await service.deleteCalculation('calc-123');

      expect(preferencesSpy.set).toHaveBeenCalledWith(
        jasmine.objectContaining({
          value: JSON.stringify([]),
        }),
      );
    });
  });

  describe('user preferences', () => {
    it('returns default preferences when none stored', async () => {
      preferencesSpy.get.and.resolveTo({ value: null });
      const prefs = await service.getPreferences();
      expect(prefs.autoShare).toBeTrue();
    });

    it('returns merged preferences when stored', async () => {
      preferencesSpy.get.and.resolveTo({
        value: JSON.stringify({ autoShare: false }),
      });
      const prefs = await service.getPreferences();
      expect(prefs.autoShare).toBeFalse();
    });

    it('recovers with default preferences on corrupt JSON', async () => {
      preferencesSpy.get.and.resolveTo({ value: 'invalid-json' });
      const prefs = await service.getPreferences();
      expect(prefs.autoShare).toBeTrue();
    });

    it('saves user preferences', async () => {
      await service.savePreferences({ autoShare: false });
      expect(preferencesSpy.set).toHaveBeenCalledWith({
        key: 'termocalc-portfolio.user-preferences',
        value: JSON.stringify({ autoShare: false }),
      });
    });
  });
});
