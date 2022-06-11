import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { Observable } from 'rxjs';
import { SettingsService } from '../services/settings.service';

import { SettingsComponent } from './settings.component';

const mockSettingsService = mock<SettingsService>();

const bootstrapSettingsService = () => {
  TestBed.configureTestingModule({
    providers: [
      { provide: SettingsService, useValue: mockSettingsService },
      SettingsComponent,
    ],
  }).compileComponents();

  return TestBed.inject(SettingsComponent);
};

describe('SettingsComponent', () => {
  it('should create', () => {
    const component = bootstrapSettingsService();
    expect(component).toBeTruthy();
  });

  it('should update the settings service when pay cycle is changed', () => {
    const component = bootstrapSettingsService();

    component.form.controls.payCycle.setValue('foo string');

    expect(mockSettingsService.setSettings).toHaveBeenCalledWith({
      payCycle: 'foo string',
      payAmount: 0,
      overdraft: 0,
    });
  });

  it('should update the settings service when overdraft is changed', () => {
    const component = bootstrapSettingsService();

    component.form.controls.overdraft.setValue(1000);

    expect(mockSettingsService.setSettings).toHaveBeenCalledWith({
      overdraft: 1000,
      payAmount: 0,
      payCycle: '',
    });
  });

  it('should update the settings', () => {
    const component = bootstrapSettingsService();

    component.form.controls.expectedSalary.setValue(95000);

    expect(mockSettingsService.setSettings).toHaveBeenCalledWith({
      payAmount: 95000,
      overdraft: 0,
      payCycle: '',
    });
  });

  it('should have set values to whatever the settings service provides', async () => {
    mockSettingsService.getSettings.mockReturnValue(
      new Observable((subscriber) =>
        subscriber.next({
          overdraft: 99,
          payAmount: 1021,
          payCycle: 'hello!',
        })
      )
    );

    const component = bootstrapSettingsService();

    await component.ngOnInit();

    expect(component.form.controls.expectedSalary.getRawValue()).toEqual(1021);
  });
});
