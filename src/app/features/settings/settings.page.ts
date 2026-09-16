import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToggle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, sparklesOutline } from 'ionicons/icons';

import { LocalDataService } from '../../core/services/local-data.service';
import { EntitlementService } from '../../core/services/entitlement.service';
import { PREMIUM } from '../../core/i18n/messages';
import { PremiumProduct } from '../../shared/models/entitlement.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToggle,
    IonToast,
    IonToolbar,
  ],
})
export class SettingsPage {
  private readonly data = inject(LocalDataService);
  private readonly router = inject(Router);
  private readonly entitlement = inject(EntitlementService);

  autoShare = true;
  savedMessageVisible = false;
  infoMessageVisible = false;
  infoMessage = '';
  processing = false;
  readonly premiumStatus = this.entitlement.premium;
  readonly product: PremiumProduct = this.entitlement.getProduct();
  readonly monetizationEnabled = this.entitlement.monetizationEnabled;

  constructor() {
    addIcons({ checkmarkCircleOutline, sparklesOutline });
    void this.loadPreferences();
  }

  get isPremium(): boolean {
    return this.entitlement.unlocked();
  }

  async loadPreferences(): Promise<void> {
    this.autoShare = (await this.data.getPreferences()).autoShare;
  }

  async updateAutoShare(event: CustomEvent): Promise<void> {
    this.autoShare = Boolean(event.detail.checked);
    await this.data.savePreferences({ autoShare: this.autoShare });
    this.savedMessageVisible = true;
  }

  async subscribe(): Promise<void> {
    this.processing = true;
    try {
      const status = await this.entitlement.purchase();
      this.showInfo(
        status.tier === 'premium'
          ? PREMIUM.subscribeSuccess
          : PREMIUM.subscribeIncomplete,
      );
    } catch {
      this.showInfo(PREMIUM.subscribeError);
    } finally {
      this.processing = false;
    }
  }

  async restore(): Promise<void> {
    this.processing = true;
    try {
      const status = await this.entitlement.restore();
      this.showInfo(
        status.tier === 'premium'
          ? PREMIUM.restoreSuccess
          : PREMIUM.restoreEmpty,
      );
    } catch {
      this.showInfo(PREMIUM.restoreError);
    } finally {
      this.processing = false;
    }
  }

  goBack(): void {
    void this.router.navigateByUrl('/home');
  }

  private showInfo(message: string): void {
    this.infoMessage = message;
    this.infoMessageVisible = true;
  }
}
