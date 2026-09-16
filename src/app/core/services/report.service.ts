import { inject, Injectable, InjectionToken } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { PdfViewer } from '../native/pdf-viewer';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { APP, REPORT_PDF } from '../i18n/messages';
import { SavedCalculation } from '../../shared/models/saved-calculation.model';

export const REPORT_FILESYSTEM = new InjectionToken<typeof Filesystem>('Report filesystem', {
  providedIn: 'root', factory: () => Filesystem,
});
export const REPORT_SHARE = new InjectionToken<typeof Share>('Report share', {
  providedIn: 'root', factory: () => Share,
});
export type ShareOutcome = 'shared' | 'cancelled' | 'unavailable';
export const REPORT_VIEWER = new InjectionToken<typeof PdfViewer>('Report viewer', {
  providedIn: 'root', factory: () => PdfViewer,
});

export class ReportAlreadyExistsError extends Error {
  constructor() {
    super('Já existe um relatório com esse nome. Escolha outro título.');
    this.name = 'ReportAlreadyExistsError';
  }
}

export interface ReportOptions {
  responsavel?: string;
  share?: boolean;
}

export interface ReportResult {
  fileName: string;
  uri?: string;
  shared: boolean;
}

export interface ReportFile {
  name: string;
  title: string;
  uri: string;
  size: number;
  modifiedAt: number;
}

// Reports are grouped in this subfolder of the Documents directory.
const REPORTS_DIR = 'TermoCalcPortfolio';

// Logo shown in the PDF header (same asset used by the legacy app).
const LOGO_ASSET_PATH = 'assets/imgs/fluxo-ar-model.png';

// pdfmake is loaded lazily to keep it out of the initial bundle and unit tests.
type PdfMake = {
  vfs: unknown;
  createPdf: (def: TDocumentDefinitions) => {
    getBase64: (cb: (data: string) => void) => void;
  };
};

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly filesystem = inject(REPORT_FILESYSTEM);
  private readonly share = inject(REPORT_SHARE);
  private readonly viewer = inject(REPORT_VIEWER);
  private pdfMake?: PdfMake;
  private logoBase64?: string | null;

  async generate(
    calculation: SavedCalculation,
    options: ReportOptions = {},
  ): Promise<ReportResult> {
    const fileName = this.buildFileName(calculation.title);
    if (Capacitor.isNativePlatform()) {
      await this.ensureNewReport(fileName);
    }
    const logo = await this.loadLogo();
    const docDefinition = this.buildDocDefinition(
      calculation,
      options.responsavel,
      logo ?? undefined,
    );
    const base64 = await this.toBase64(docDefinition);

    if (Capacitor.isNativePlatform()) {
      const written = await this.filesystem.writeFile({
        path: `${REPORTS_DIR}/${fileName}`,
        data: base64,
        directory: Directory.Documents,
        recursive: true,
      });

      if (options.share) {
        const outcome = await this.shareUri(written.uri, calculation.title);
        return { fileName, uri: written.uri, shared: outcome === 'shared' };
      }

      return { fileName, uri: written.uri, shared: false };
    }

    this.downloadOnWeb(base64, fileName);
    return { fileName, shared: false };
  }

  async listReports(): Promise<ReportFile[]> {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    try {
      const result = await this.filesystem.readdir({
        path: REPORTS_DIR,
        directory: Directory.Documents,
      });
      return result.files
        .filter((file) => file.name.toLowerCase().endsWith('.pdf'))
        .map((file) => ({
          name: file.name,
          title: this.titleFromFileName(file.name),
          uri: file.uri,
          size: file.size,
          modifiedAt: file.mtime ?? 0,
        }))
        .sort((a, b) => b.modifiedAt - a.modifiedAt);
    } catch {
      // Directory not created yet: no reports.
      return [];
    }
  }

  async shareReport(file: ReportFile): Promise<ShareOutcome> {
    return this.shareUri(file.uri, file.title);
  }

  async openReport(file: ReportFile): Promise<void> {
    await this.viewer.open({ uri: file.uri });
  }

  async deleteReport(file: ReportFile): Promise<void> {
    await this.filesystem.deleteFile({
      path: `${REPORTS_DIR}/${file.name}`,
      directory: Directory.Documents,
    });
  }

  private async ensureNewReport(fileName: string): Promise<void> {
    try {
      await this.filesystem.stat({
        path: `${REPORTS_DIR}/${fileName}`,
        directory: Directory.Documents,
      });
    } catch (error: unknown) {
      // Capacitor Filesystem 7: only a missing file permits creation.
      if (typeof error === 'object' && error !== null &&
          'code' in error && error.code === 'OS-PLUG-FILE-0008') {
        return;
      }
      throw error;
    }
    throw new ReportAlreadyExistsError();
  }

  private async shareUri(uri: string, title: string): Promise<ShareOutcome> {
    const canShare = await this.share.canShare();
    if (!canShare.value) {
      return 'unavailable';
    }
    try {
      await this.share.share({
        title: REPORT_PDF.shareTitle,
        text: REPORT_PDF.shareText(title),
        url: uri,
      });
      return 'shared';
    } catch (error: unknown) {
      // Both native Share implementations use this message on user cancellation.
      if (typeof error === 'object' && error !== null &&
          'message' in error && error.message === 'Share canceled') {
        return 'cancelled';
      }
      throw error;
    }
  }

  private titleFromFileName(name: string): string {
    return name
      .replace(/\.pdf$/i, '')
      .replace(/^termocalc-/i, '')
      .replace(/-/g, ' ')
      .trim();
  }

  buildDocDefinition(
    calculation: SavedCalculation,
    responsavel?: string,
    logo?: string,
  ): TDocumentDefinitions {
    const createdAt = new Date(calculation.createdAt);
    const number = (value: number, digits = 2): string =>
      value.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    const currency = (value: number): string =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const brandBlock = {
      stack: [
        { text: APP.name, style: 'brand' },
        {
          text: APP.tagline,
          style: 'subtitle',
        },
      ],
    };
    const header = logo
      ? {
          columns: [
            { image: logo, width: 70 },
            {
              ...brandBlock,
              margin: [12, 8, 0, 0] as [number, number, number, number],
            },
          ],
          columnGap: 8,
        }
      : brandBlock;

    return {
      info: {
        title: REPORT_PDF.documentTitle(calculation.title),
        author: APP.name,
      },
      pageMargins: [40, 60, 40, 60],
      footer: { text: 'Demo — dados fictícios.', alignment: 'center', fontSize: 9 },
      content: [
        header,
        {
          text: calculation.title,
          style: 'reportTitle',
          margin: [0, 16, 0, 0],
        },
        {
          text: [
            responsavel ? `Responsável: ${responsavel}\n` : '',
            `Emitido em: ${createdAt.toLocaleString('pt-BR')}`,
          ],
          style: 'meta',
          margin: [0, 0, 0, 16],
        },
        { text: 'Valores de entrada', style: 'sectionHeader' },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Parâmetro', style: 'th' },
                { text: 'Valor', style: 'th' },
              ],
              [
                'Temperatura de infiltração (°C)',
                number(calculation.temperaturaInf),
              ],
              ['Umidade de infiltração (%)', number(calculation.umidadeInf)],
              [
                'Temperatura refrigerada (°C)',
                number(calculation.temperaturaRef),
              ],
              ['Umidade refrigerada (%)', number(calculation.umidadeRef)],
              ['Largura da abertura (m)', number(calculation.larguraAbert)],
              ['Altura da abertura (m)', number(calculation.alturaAbert)],
              ['Tempo de abertura (min)', number(calculation.tempoAbert)],
              ['COP da sala de máquinas', number(calculation.cop)],
              ['Custo kW/h (R$)', currency(calculation.custoKw)],
              [
                'Eficiência das cortinas (%)',
                number(calculation.eficienciaCort),
              ],
              ['Altitude (m)', number(calculation.altitude)],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: 'Resultados',
          style: 'sectionHeader',
          margin: [0, 16, 0, 0],
        },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Indicador', style: 'th' },
                { text: 'Valor', style: 'th' },
              ],
              ['Área da abertura (m²)', number(calculation.areaAbertura)],
              [
                'Entalpia de infiltração (kJ/kg)',
                number(calculation.entalpiaInfilt, 5),
              ],
              [
                'Entalpia refrigerada (kJ/kg)',
                number(calculation.entalpiaRef, 5),
              ],
              [
                'Densidade de infiltração (kg/m³)',
                number(calculation.densidadeInfilt, 5),
              ],
              [
                'Densidade refrigerada (kg/m³)',
                number(calculation.densidadeRef, 5),
              ],
              ['Fator mássico (FM)', number(calculation.fm, 5)],
              ['Fluxo de calor (kcal/h)', number(calculation.fluxoCaloKcal)],
              ['Fluxo de calor (kW)', number(calculation.fluxoCalorKw)],
              ['Consumo (kWh)', number(calculation.consumo)],
              ['Custo por hora', currency(calculation.custoHora)],
              ['Custo por dia', currency(calculation.custoDia)],
              ['Custo por mês', currency(calculation.custoMes)],
              ['Custo por ano', currency(calculation.custoAno)],
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        brand: { fontSize: 22, bold: true, color: '#6a0080' },
        subtitle: { fontSize: 10, color: '#555555' },
        reportTitle: { fontSize: 16, bold: true },
        meta: { fontSize: 9, color: '#777777' },
        sectionHeader: {
          fontSize: 13,
          bold: true,
          color: '#6a0080',
          margin: [0, 8, 0, 4],
        },
        table: { fontSize: 10 },
        th: { bold: true, fillColor: '#f2e7f6' },
      },
    };
  }

  buildFileName(title: string): string {
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
    return `termocalc-${slug || 'relatorio'}.pdf`;
  }

  private async toBase64(docDefinition: TDocumentDefinitions): Promise<string> {
    const pdfMake = await this.loadPdfMake();
    return new Promise<string>((resolve) => {
      pdfMake.createPdf(docDefinition).getBase64((data) => resolve(data));
    });
  }

  private async loadLogo(): Promise<string | null> {
    if (this.logoBase64 !== undefined) {
      return this.logoBase64;
    }
    try {
      const response = await fetch(LOGO_ASSET_PATH);
      if (!response.ok) {
        this.logoBase64 = null;
        return null;
      }
      const blob = await response.blob();
      this.logoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return this.logoBase64;
    } catch {
      this.logoBase64 = null;
      return null;
    }
  }

  private async loadPdfMake(): Promise<PdfMake> {
    if (this.pdfMake) {
      return this.pdfMake;
    }

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = ((pdfMakeModule as { default?: unknown }).default ??
      pdfMakeModule) as unknown as PdfMake;
    const vfs =
      (pdfFontsModule as { default?: unknown }).default ?? pdfFontsModule;
    pdfMake.vfs = vfs;
    this.pdfMake = pdfMake;
    return pdfMake;
  }

  private downloadOnWeb(base64: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = fileName;
    link.click();
  }
}
