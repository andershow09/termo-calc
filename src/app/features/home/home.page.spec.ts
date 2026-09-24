import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { HomePage } from './home.page';
import { CalculateFlowService } from '../../core/services/calculate-flow.service';
import { CalculationSessionService } from '../../core/services/calculation-session.service';
import { DeviceLocationService } from '../../core/services/device-location.service';
import { DEFAULT_INPUT_CALC } from '../../shared/models/fluxo-ar.model';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let sessionSpy: jasmine.SpyObj<CalculationSessionService>;
  let locationSpy: jasmine.SpyObj<DeviceLocationService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    sessionSpy = jasmine.createSpyObj('CalculationSessionService', ['getInput', 'save', 'clear']);
    sessionSpy.getInput.and.returnValue(null);

    locationSpy = jasmine.createSpyObj('DeviceLocationService', ['getAltitude']);
    locationSpy.getAltitude.and.resolveTo({ status: 'success', altitude: 750 });

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        CalculateFlowService,
        { provide: Router, useValue: routerSpy },
        { provide: CalculationSessionService, useValue: sessionSpy },
        { provide: DeviceLocationService, useValue: locationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes form with empty values and altitude from location', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.form.controls.temperaturaInf.value).toBeNull();
    expect(component.form.controls.altitude.value).toBe(750);
  });

  it('populates form from calculation session if available on init', () => {
    sessionSpy.getInput.and.returnValue(DEFAULT_INPUT_CALC);
    const initFixture = TestBed.createComponent(HomePage);
    const initComponent = initFixture.componentInstance;
    initFixture.detectChanges();

    expect(initComponent.form.controls.temperaturaInf.value).toBe(DEFAULT_INPUT_CALC.temperaturaInf);
    expect(initComponent.form.controls.cop.value).toBe(DEFAULT_INPUT_CALC.cop);
  });

  it('validates humidity between 0 and 100', () => {
    const control = component.form.controls.umidadeInf;
    control.setValue(-5);
    expect(control.invalid).toBeTrue();

    control.setValue(105);
    expect(control.invalid).toBeTrue();

    control.setValue(60);
    expect(control.valid).toBeTrue();
  });

  it('validates cop between 0.01 and 7', () => {
    const control = component.form.controls.cop;
    control.setValue(0);
    expect(control.invalid).toBeTrue();

    control.setValue(8);
    expect(control.invalid).toBeTrue();

    control.setValue(3.5);
    expect(control.valid).toBeTrue();
  });

  it('toggles temperature sign correctly', () => {
    component.form.controls.temperaturaInf.setValue(0);
    component.toggleTemperatureSign('temperaturaInf');
    expect(component.form.controls.temperaturaInf.value).toBe(-0.1);

    component.form.controls.temperaturaInf.setValue(10);
    component.toggleTemperatureSign('temperaturaInf');
    expect(component.form.controls.temperaturaInf.value).toBe(-10);

    component.toggleTemperatureSign('temperaturaInf');
    expect(component.form.controls.temperaturaInf.value).toBe(10);
  });

  it('manages hint visibility', () => {
    expect(component.activeHint).toBeNull();
    expect(component.activeFieldHint).toBeNull();

    component.toggleHint('temperaturaInf');
    expect(component.activeHint).toBe('temperaturaInf');
    expect(component.activeFieldHint).toBeDefined();

    component.closeHint();
    expect(component.activeHint).toBeNull();
  });

  it('fills sample data via fillSampleData', () => {
    component.fillSampleData();

    expect(component.form.valid).toBeTrue();
    expect(component.form.controls.temperaturaInf.value).toBe(DEFAULT_INPUT_CALC.temperaturaInf);
    expect(component.form.controls.cop.value).toBe(DEFAULT_INPUT_CALC.cop);
  });

  it('does not calculate or navigate when form is invalid', () => {
    component.calculate();

    expect(sessionSpy.save).not.toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('calculates, saves session and navigates when form is valid', () => {
    component.fillSampleData();
    component.calculate();

    expect(sessionSpy.save).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/results');
  });

  it('resets form and clears calculation session', () => {
    component.fillSampleData();
    expect(component.form.valid).toBeTrue();

    component.reset();

    expect(sessionSpy.clear).toHaveBeenCalled();
    expect(component.form.controls.temperaturaInf.value).toBeNull();
    expect(component.form.controls.altitude.value).toBe(DEFAULT_INPUT_CALC.altitude);
  });
});
