import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonAlert,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  createOutline,
  documentTextOutline,
  ellipsisVerticalOutline,
  lockClosedOutline,
  saveOutline,
  shareSocialOutline,
} from 'ionicons/icons';

import { InputCalc, ResultCalc } from '../../shared/models/fluxo-ar.model';
import { SavedCalculation } from '../../shared/models/saved-calculation.model';
import { COMMON, PREMIUM, RESULTS } from '../../core/i18n/messages';
import { CalculationSessionService } from '../../core/services/calculation-session.service';
import { LocalDataService } from '../../core/services/local-data.service';
import {
  EntitlementService,
  FREE_SAVED_LIMIT,
} from '../../core/services/entitlement.service';
import { ReportAlreadyExistsError, ReportService } from '../../core/services/report.service';
import { OptionsMenuComponent } from '../../shared/components/options-menu/options-menu.component';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
  imports: [
    CommonModule,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonHeader,
    IonIcon,
    IonAlert,
    IonTitle,
    IonToast,
    IonToolbar,
    OptionsMenuComponent,
  ],
})
export class ResultsPage {
  private readonly router = inject(Router);
  private readonly session = inject(CalculationSessionService);
  private readonly data = inject(LocalDataService);
  private readonly entitlement = inject(EntitlementService);
  private readonly reports = inject(ReportService);

  readonly result: ResultCalc | null = this.session.getResult();
  readonly input: InputCalc | null = this.session.getInput();
  readonly premiumStatus = this.entitlement.premium;
  saveAlertOpen = false;
  reportAlertOpen = false;
  paywallAlertOpen = false;
  readonly paywallHeader = PREMIUM.paywallHeader;
  paywallMessage = '';
  generatingReport = false;
  savedMessageVisible = false;
  infoMessageVisible = false;
  infoMessage = '';
  errorMessageVisible = false;
  errorMessage = '';
  readonly saveAlertButtons = [
    { text: COMMON.cancel, role: 'cancel' },
    {
      text: COMMON.save,
      role: 'confirm',
      handler: (data: { title?: string }) => this.save(data?.title ?? ''),
    },
  ];
  readonly reportAlertButtons = [
    { text: COMMON.cancel, role: 'cancel' },
    {
      text: COMMON.generate,
      role: 'confirm',
      handler: (data: { title?: string; responsavel?: string }) =>
        this.generateReport(data?.title ?? '', data?.responsavel ?? ''),
    },
  ];
  readonly paywallButtons = [
    { text: COMMON.notNow, role: 'cancel' },
    {
      text: PREMIUM.paywallCta,
      role: 'confirm',
      handler: () => this.goPremium(),
    },
  ];

  constructor() {
    addIcons({
      arrowBackOutline,
      createOutline,
      documentTextOutline,
      ellipsisVerticalOutline,
      lockClosedOutline,
      saveOutline,
      shareSocialOutline,
    });

    if (!this.result) {
      void this.router.navigateByUrl('/home');
    }
  }

  get isPremium(): boolean {
    return this.entitlement.unlocked();
  }

  edit(): void {
    void this.router.navigateByUrl('/home');
  }

  async openSaveDialog(): Promise<void> {
    if (!this.isPremium) {
      const count = (await this.data.getCalculations()).length;
      if (count >= FREE_SAVED_LIMIT) {
        this.openPaywall(RESULTS.saveLimit(FREE_SAVED_LIMIT));
        return;
      }
    }
    this.saveAlertOpen = true;
  }

  async save(title: string): Promise<void> {
    if (!this.input || !this.result) {
      this.showError(RESULTS.saveDataUnavailable);
      return;
    }

    try {
      await this.data.saveCalculation(title, this.input, this.result);
      this.saveAlertOpen = false;
      this.savedMessageVisible = true;
    } catch {
      this.showError(RESULTS.saveError);
    }
  }

  requestReport(): void {
    if (!this.input || !this.result) {
      this.showError(RESULTS.reportDataUnavailable);
      return;
    }
    if (!this.isPremium) {
      this.openPaywall(RESULTS.reportsPremium);
      return;
    }
    this.reportAlertOpen = true;
  }

  async generateReport(title: string, responsavel = ''): Promise<void> {
    if (this.generatingReport) {
      return;
    }
    this.reportAlertOpen = false;
    if (!this.input || !this.result) {
      return;
    }

    const calculation: SavedCalculation = {
      ...this.input,
      ...this.result,
      id: crypto.randomUUID(),
      title: title.trim() || RESULTS.defaultTitle,
      createdAt: new Date().toISOString(),
    };

    this.generatingReport = true;
    try {
      const preferences = await this.data.getPreferences();
      const outcome = await this.reports.generate(calculation, {
        share: preferences.autoShare,
        responsavel: responsavel.trim() || undefined,
      });
      this.showInfo(
        outcome.shared ? RESULTS.reportShared : RESULTS.reportGenerated,
      );
    } catch (error: unknown) {
      this.showError(error instanceof ReportAlreadyExistsError ? error.message : RESULTS.reportError);
    } finally {
      this.generatingReport = false;
    }
  }

  goPremium(): void {
    this.paywallAlertOpen = false;
    void this.router.navigateByUrl('/settings');
  }

  private openPaywall(message: string): void {
    this.paywallMessage = message;
    this.paywallAlertOpen = true;
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
