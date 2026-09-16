import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonAlert,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  lockClosedOutline,
  shareSocialOutline,
  trashOutline,
} from 'ionicons/icons';

import { COMMON, PREMIUM, REPORTS } from '../../core/i18n/messages';
import { EntitlementService } from '../../core/services/entitlement.service';
import { ReportFile, ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
    CommonModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonAlert,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class ReportsPage {
  private readonly router = inject(Router);
  private readonly entitlement = inject(EntitlementService);
  private readonly reports = inject(ReportService);

  files: ReportFile[] = [];
  loading = true;
  readonly isNative = Capacitor.isNativePlatform();
  readonly premiumStatus = this.entitlement.premium;
  busyName: string | null = null;
  paywallAlertOpen = false;
  readonly paywallHeader = PREMIUM.paywallHeader;
  readonly paywallMessage = REPORTS.paywallMessage;
  deleteTarget: ReportFile | null = null;
  infoMessageVisible = false;
  infoMessage = '';
  errorMessageVisible = false;
  errorMessage = '';
  readonly paywallButtons = [
    { text: COMMON.notNow, role: 'cancel' },
    {
      text: PREMIUM.paywallCta,
      role: 'confirm',
      handler: () => this.goPremium(),
    },
  ];
  readonly deleteButtons = [
    { text: COMMON.cancel, role: 'cancel' },
    {
      text: COMMON.delete,
      role: 'destructive',
      handler: () => this.confirmDelete(),
    },
  ];

  constructor() {
    addIcons({
      documentTextOutline,
      lockClosedOutline,
      shareSocialOutline,
      trashOutline,
    });
    void this.loadReports();
  }

  get isPremium(): boolean {
    return this.entitlement.unlocked();
  }

  async loadReports(): Promise<void> {
    this.loading = true;
    this.files = await this.reports.listReports();
    this.loading = false;
  }

  goBack(): void {
    void this.router.navigateByUrl('/home');
  }

  async share(file: ReportFile): Promise<void> {
    if (!this.isPremium) {
      this.paywallAlertOpen = true;
      return;
    }

    this.busyName = file.name;
    try {
      const shared = await this.reports.shareReport(file);
      if (shared === 'unavailable') {
        this.showError(REPORTS.shareUnavailable);
      }
    } catch {
      this.showError(REPORTS.shareError);
    } finally {
      this.busyName = null;
    }
  }

  async open(file: ReportFile): Promise<void> {
    if (this.busyName !== null) {
      return;
    }
    this.busyName = file.name;
    try {
      await this.reports.openReport(file);
    } catch (error: unknown) {
      const noViewer =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'NO_PDF_VIEWER';
      this.showError(
        noViewer
          ? 'Instale um visualizador de PDF para abrir este arquivo.'
          : 'Não foi possível abrir o PDF. Verifique se o arquivo ainda está disponível.',
      );
    } finally {
      this.busyName = null;
    }
  }

  requestDelete(file: ReportFile): void {
    this.deleteTarget = file;
  }

  async confirmDelete(): Promise<void> {
    const target = this.deleteTarget;
    this.deleteTarget = null;
    if (!target) {
      return;
    }

    try {
      await this.reports.deleteReport(target);
      this.showInfo(REPORTS.deleted);
      await this.loadReports();
    } catch {
      this.showError(REPORTS.deleteError);
    }
  }

  goPremium(): void {
    this.paywallAlertOpen = false;
    void this.router.navigateByUrl('/settings');
  }

  private showInfo(message: string): void {
    this.infoMessage = message;
    this.infoMessageVisible = true;
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.errorMessageVisible = true;
  }
}
