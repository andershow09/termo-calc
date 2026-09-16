import { TestBed } from '@angular/core/testing';
import { DEMO_RESULT } from './calculate-flow.service';

import { Capacitor } from '@capacitor/core';
import { Directory } from '@capacitor/filesystem';
import {
  REPORT_FILESYSTEM,
  REPORT_SHARE,
  REPORT_VIEWER,
  ReportAlreadyExistsError,
  ReportService,
} from './report.service';
import { SavedCalculation } from '../../shared/models/saved-calculation.model';

const CALCULATION: SavedCalculation = {
  temperaturaInf: 15,
  umidadeInf: 50,
  temperaturaRef: -15,
  umidadeRef: 50,
  larguraAbert: 3,
  alturaAbert: 3,
  tempoAbert: 15,
  cop: 5,
  custoKw: 1,
  eficienciaCort: 30,
  acelaracaoGravitacional: 9.81,
  altitude: 0,
  ...DEMO_RESULT,
  id: 'test-id',
  title: 'Câmara principal',
  createdAt: '2024-01-10T12:00:00.000Z',
};

describe('ReportService', () => {
  let service: ReportService;
  let filesystem: jasmine.SpyObj<{
    stat: (options: unknown) => Promise<unknown>;
    writeFile: (options: unknown) => Promise<{ uri: string }>;
  }>;
  let share: jasmine.SpyObj<{
    canShare: () => Promise<{ value: boolean }>;
    share: () => Promise<unknown>;
  }>;
  let viewer: jasmine.SpyObj<{
    open: (options: { uri: string }) => Promise<void>;
  }>;

  beforeEach(() => {
    filesystem = jasmine.createSpyObj('Filesystem', ['stat', 'writeFile']);
    share = jasmine.createSpyObj('Share', ['canShare', 'share']);
    viewer = jasmine.createSpyObj('PdfViewer', ['open']);
    viewer.open.and.resolveTo();
    TestBed.configureTestingModule({
      providers: [
        { provide: REPORT_FILESYSTEM, useValue: filesystem },
        { provide: REPORT_SHARE, useValue: share },
        { provide: REPORT_VIEWER, useValue: viewer },
      ],
    });
    service = TestBed.inject(ReportService);
  });

  it('marks exported documents as fictional demo data', () => {
    const doc = service.buildDocDefinition(CALCULATION);
    expect(JSON.stringify(doc)).toContain('dados fictícios');
    expect(JSON.stringify(doc.footer)).toContain('Demo — dados fictícios.');
  });

  describe('native report lifecycle', () => {
    beforeEach(() => {
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
      filesystem.stat.and.rejectWith({ code: 'OS-PLUG-FILE-0008' });
      filesystem.writeFile.and.resolveTo({
        uri: 'file:///Documents/TermoCalcPortfolio/report.pdf',
      });
      share.canShare.and.resolveTo({ value: true });
      share.share.and.resolveTo({});
      const renderer = service as unknown as {
        loadLogo: () => Promise<null>;
        toBase64: () => Promise<string>;
      };
      spyOn(renderer, 'loadLogo').and.resolveTo(null);
      spyOn(renderer, 'toBase64').and.resolveTo('JVBERi0=');
    });

    it('keeps the generated PDF when sharing is cancelled', async () => {
      share.share.and.rejectWith({ message: 'Share canceled' });
      const result = await service.generate(CALCULATION, { share: true });
      expect(result.shared).toBeFalse();
      expect(result.uri).toContain('report.pdf');
      expect(filesystem.writeFile).toHaveBeenCalledTimes(1);
    });

    it('rejects a duplicate name without writing or sharing', async () => {
      filesystem.stat.and.resolveTo({});
      await expectAsync(
        service.generate(CALCULATION, { share: true }),
      ).toBeRejectedWithError(ReportAlreadyExistsError);
      expect(filesystem.writeFile).not.toHaveBeenCalled();
      expect(share.share).not.toHaveBeenCalled();
    });

    it('does not treat permission errors as a missing file', async () => {
      const error = { code: 'OS-PLUG-FILE-0007' };
      filesystem.stat.and.rejectWith(error);
      await expectAsync(service.generate(CALCULATION)).toBeRejectedWith(error);
      expect(filesystem.writeFile).not.toHaveBeenCalled();
    });

    it('writes to Documents and skips sharing when automatic sharing is off', async () => {
      const result = await service.generate(CALCULATION, { share: false });
      expect(filesystem.writeFile).toHaveBeenCalledWith(
        jasmine.objectContaining({
          directory: Directory.Documents,
          path: 'TermoCalcPortfolio/termocalc-c-mara-principal.pdf',
        }),
      );
      expect(result.shared).toBeFalse();
      expect(share.canShare).not.toHaveBeenCalled();
    });

    it('distinguishes cancellation from sharing being unavailable for saved PDFs', async () => {
      const file = {
        name: 'report.pdf',
        title: 'Teste',
        uri: 'file:///report.pdf',
        size: 10,
        modifiedAt: 0,
      };
      share.share.and.rejectWith({ message: 'Share canceled' });
      expect(await service.shareReport(file)).toBe('cancelled');
      share.canShare.and.resolveTo({ value: false });
      expect(await service.shareReport(file)).toBe('unavailable');
    });

    it('propagates actual sharing failures', async () => {
      share.share.and.rejectWith(new Error('Provider failed'));
      await expectAsync(
        service.generate(CALCULATION, { share: true }),
      ).toBeRejectedWithError('Provider failed');
    });
  });

  it('opens a saved report in the native PDF viewer', async () => {
    const file = {
      name: 'report.pdf',
      title: 'Teste',
      uri: 'file:///Documents/TermoCalcPortfolio/report.pdf',
      size: 10,
      modifiedAt: 0,
    };

    await service.openReport(file);

    expect(viewer.open).toHaveBeenCalledOnceWith({ uri: file.uri });
  });

  it('builds a document definition with input and result tables', () => {
    const doc = service.buildDocDefinition(CALCULATION, 'Eng. Ana');
    const content = doc.content as unknown as Array<Record<string, unknown>>;

    expect(content.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(doc);
    expect(serialized).toContain('Valores de entrada');
    expect(serialized).toContain('Resultados');
    expect(serialized).toContain('Eng. Ana');
    expect(serialized).toContain('Câmara principal');
  });

  it('omits the responsible line when not provided', () => {
    const doc = service.buildDocDefinition(CALCULATION);
    expect(JSON.stringify(doc)).not.toContain('Responsável');
  });

  it('creates a slugified pdf file name', () => {
    expect(service.buildFileName('Câmara Principal 01')).toBe(
      'termocalc-c-mara-principal-01.pdf',
    );
  });

  it('falls back to a default file name for empty titles', () => {
    expect(service.buildFileName('   ')).toBe('termocalc-relatorio.pdf');
  });
});
