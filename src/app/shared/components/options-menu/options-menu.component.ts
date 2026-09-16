import { Component, Input, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  ellipsisVerticalOutline,
  informationCircleOutline,
  settingsOutline,
  starOutline,
} from 'ionicons/icons';

import { EntitlementService } from '../../../core/services/entitlement.service';
import { MENU } from '../../../core/i18n/messages';

export interface OptionsMenuItem {
  label: string;
  route: string;
  icon: string;
  color?: string;
  premium?: boolean;
}

const DEFAULT_ITEMS: OptionsMenuItem[] = [
  {
    label: MENU.savedResults,
    route: '/saved-results',
    icon: 'star-outline',
    color: 'warning',
  },
  {
    label: MENU.reports,
    route: '/reports',
    icon: 'document-text-outline',
    color: 'primary',
  },
  {
    label: MENU.settings,
    route: '/settings',
    icon: 'settings-outline',
    color: 'medium',
  },
  {
    label: MENU.about,
    route: '/about',
    icon: 'information-circle-outline',
    color: 'tertiary',
  },
];

@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss'],
  imports: [
    IonBadge,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPopover,
  ],
})
export class OptionsMenuComponent {
  private readonly router = inject(Router);
  private readonly entitlement = inject(EntitlementService);

  @Input() items: OptionsMenuItem[] = DEFAULT_ITEMS;

  @ViewChild(IonPopover) private popover?: IonPopover;

  readonly premiumStatus = this.entitlement.premium;
  isOpen = false;

  constructor() {
    addIcons({
      documentTextOutline,
      ellipsisVerticalOutline,
      informationCircleOutline,
      settingsOutline,
      starOutline,
    });
  }

  get isPremium(): boolean {
    return this.entitlement.unlocked();
  }

  open(): void {
    this.isOpen = true;
  }

  async select(route: string): Promise<void> {
    this.isOpen = false;
    await this.popover?.dismiss();
    await this.router.navigateByUrl(route);
  }
}
