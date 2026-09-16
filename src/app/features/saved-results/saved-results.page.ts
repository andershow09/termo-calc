import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calculatorOutline,
  trashOutline,
} from 'ionicons/icons';

import { SavedCalculation } from '../../shared/models/saved-calculation.model';
import { CalculationSessionService } from '../../core/services/calculation-session.service';
import { LocalDataService } from '../../core/services/local-data.service';

@Component({
  selector: 'app-saved-results',
  templateUrl: './saved-results.page.html',
  styleUrls: ['./saved-results.page.scss'],
  imports: [
    CommonModule,
    IonAlert,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
})
export class SavedResultsPage {
  private readonly data = inject(LocalDataService);
  private readonly router = inject(Router);
  private readonly session = inject(CalculationSessionService);

  calculations: SavedCalculation[] = [];
  pendingDelete: SavedCalculation | null = null;
  deleteAlertOpen = false;
  readonly deleteAlertButtons = [
    { text: 'Cancelar', role: 'cancel' },
    {
      text: 'Excluir',
      role: 'destructive',
      handler: () => this.deletePending(),
    },
  ];

  constructor() {
    addIcons({ arrowBackOutline, calculatorOutline, trashOutline });
    void this.loadCalculations();
  }

  async loadCalculations(): Promise<void> {
    this.calculations = await this.data.getCalculations();
  }

  openCalculation(calculation: SavedCalculation): void {
    this.session.save(calculation, calculation);
    void this.router.navigateByUrl('/results');
  }

  confirmDelete(calculation: SavedCalculation): void {
    this.pendingDelete = calculation;
    this.deleteAlertOpen = true;
  }

  async deletePending(): Promise<void> {
    if (!this.pendingDelete) {
      return;
    }

    await this.data.deleteCalculation(this.pendingDelete.id);
    this.pendingDelete = null;
    this.deleteAlertOpen = false;
    await this.loadCalculations();
  }

  goBack(): void {
    void this.router.navigateByUrl('/home');
  }
}
