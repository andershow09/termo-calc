import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonTitle,
  IonModal,
  IonSpinner,
  IonToast,
  IonFooter,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calculatorOutline,
  closeCircleOutline,
  flameOutline,
  helpCircleOutline,
  bulbOutline,
  locationOutline,
  removeCircleOutline,
  addCircleOutline,
  cashOutline,
  refreshOutline,
  resizeOutline,
  shieldCheckmarkOutline,
  speedometerOutline,
  timeOutline,
  thermometerOutline,
  trendingUpOutline,
  waterOutline,
} from 'ionicons/icons';

import {
  DEFAULT_INPUT_CALC,
  InputCalc,
} from '../../shared/models/fluxo-ar.model';
import { CalculateFlowService } from '../../core/services/calculate-flow.service';
import { CalculationSessionService } from '../../core/services/calculation-session.service';
import { DeviceLocationService } from '../../core/services/device-location.service';
import { OptionsMenuComponent } from '../../shared/components/options-menu/options-menu.component';
import { FieldHint, HOME_HINTS, LOCATION } from '../../core/i18n/messages';

type FieldKey =
  | 'temperaturaInf'
  | 'umidadeInf'
  | 'temperaturaRef'
  | 'umidadeRef'
  | 'larguraAbert'
  | 'alturaAbert'
  | 'tempoAbert'
  | 'cop'
  | 'custoKw'
  | 'eficienciaCort'
  | 'altitude';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonModal,
    IonSpinner,
    IonToast,
    IonFooter,
    IonTitle,
    IonToolbar,
    OptionsMenuComponent,
  ],
})
export class HomePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly calculateFlowService = inject(CalculateFlowService);
  private readonly calculationSession = inject(CalculationSessionService);
  private readonly deviceLocationService = inject(DeviceLocationService);
  private readonly router = inject(Router);

  // Somente a altitude é preenchida automaticamente (via localização); os demais
  // campos ficam em branco para preenchimento manual. Os valores de
  // DEFAULT_INPUT_CALC ficam comentados abaixo para reativação em testes futuros.
  readonly form = this.formBuilder.group({
    // temperaturaInf: DEFAULT_INPUT_CALC.temperaturaInf,
    temperaturaInf: [null as number | null, Validators.required],
    // umidadeInf: DEFAULT_INPUT_CALC.umidadeInf,
    umidadeInf: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    // temperaturaRef: DEFAULT_INPUT_CALC.temperaturaRef,
    temperaturaRef: [null as number | null, Validators.required],
    // umidadeRef: DEFAULT_INPUT_CALC.umidadeRef,
    umidadeRef: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    // larguraAbert: DEFAULT_INPUT_CALC.larguraAbert,
    larguraAbert: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    // alturaAbert: DEFAULT_INPUT_CALC.alturaAbert,
    alturaAbert: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    // tempoAbert: DEFAULT_INPUT_CALC.tempoAbert,
    tempoAbert: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(60)],
    ],
    // cop: DEFAULT_INPUT_CALC.cop,
    cop: [
      null as number | null,
      [Validators.required, Validators.min(0.01), Validators.max(7)],
    ],
    // custoKw: DEFAULT_INPUT_CALC.custoKw,
    custoKw: [null as number | null, [Validators.required, Validators.min(0)]],
    // eficienciaCort: DEFAULT_INPUT_CALC.eficienciaCort,
    eficienciaCort: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    altitude: [
      DEFAULT_INPUT_CALC.altitude,
      [Validators.required, Validators.min(0)],
    ],
  });

  // Como no legado: não é um campo do usuário, sempre a gravidade padrão.
  private readonly acelaracaoGravitacional =
    DEFAULT_INPUT_CALC.acelaracaoGravitacional;

  activeHint: string | null = null;
  menuMessage = '';
  menuMessageVisible = false;
  locationStatus: 'idle' | 'loading' | 'success' | 'denied' | 'unavailable' =
    'idle';

  readonly locationText = LOCATION;
  readonly hints: Record<string, FieldHint> = HOME_HINTS;

  get activeFieldHint(): FieldHint | null {
    return this.activeHint ? this.hints[this.activeHint] : null;
  }

  constructor() {
    const savedInput = this.calculationSession.getInput();
    if (savedInput) {
      this.form.patchValue(savedInput);
    } else {
      this.form.patchValue(DEFAULT_INPUT_CALC);
    }

    addIcons({
      calculatorOutline,
      closeCircleOutline,
      flameOutline,
      helpCircleOutline,
      bulbOutline,
      locationOutline,
      removeCircleOutline,
      addCircleOutline,
      cashOutline,
      refreshOutline,
      resizeOutline,
      shieldCheckmarkOutline,
      speedometerOutline,
      timeOutline,
      thermometerOutline,
      trendingUpOutline,
      waterOutline,
    });
    void this.loadAltitude();
  }

  toggleHint(field: FieldKey): void {
    this.activeHint = field;
  }

  closeHint(): void {
    this.activeHint = null;
  }

  toggleTemperatureSign(field: 'temperaturaInf' | 'temperaturaRef'): void {
    const control = this.form.controls[field];
    const value = control.value ?? 0;
    control.setValue(value === 0 ? -0.1 : -value);
  }

  async loadAltitude(): Promise<void> {
    if (this.locationStatus === 'loading') {
      return;
    }

    this.locationStatus = 'loading';

    try {
      const outcome = await this.deviceLocationService.getAltitude();
      if (outcome.status === 'success') {
        this.form.controls.altitude.setValue(
          Math.max(0, Math.round(outcome.altitude)),
        );
        this.locationStatus = 'success';
        return;
      }
      this.locationStatus = outcome.status;
    } catch {
      this.locationStatus = 'unavailable';
    }
  }

  calculate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const input: InputCalc = {
      ...(this.form.getRawValue() as Omit<
        InputCalc,
        'acelaracaoGravitacional'
      >),
      acelaracaoGravitacional: this.acelaracaoGravitacional,
    };
    const result = this.calculateFlowService.calculateFlow(input);
    this.calculationSession.save(input, result);
    void this.router.navigateByUrl('/results');
  }

  reset(): void {
    // this.form.reset(DEFAULT_INPUT_CALC); // TODO(testes futuros): repreencher todos os campos com os padrões
    this.form.reset({ altitude: DEFAULT_INPUT_CALC.altitude });
    this.calculationSession.clear();
  }
}
