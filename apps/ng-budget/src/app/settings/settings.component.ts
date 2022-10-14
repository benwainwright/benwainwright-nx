import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { lastValueFrom, Subscription, take } from 'rxjs';
import { validateDateString } from '../input/parse-date-validator';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'benwainwright-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;

  public form = new FormGroup({
    overdraft: new FormControl<number>(0, { nonNullable: true }),
    payCycle: new FormControl('', {
      nonNullable: true,
      validators: [validateDateString],
    }),
    expectedSalary: new FormControl<number>(0, { nonNullable: true }),
  });

  constructor(private settingService: SettingsService) {
    this.subscription = this.form.valueChanges.subscribe((value) => {
      console.log('change');
      this.settingService
        .setSettings({
          salary: value.expectedSalary,
          overdraft: value.overdraft,
          payCycle: value.payCycle,
        })
        .subscribe();
    });
  }
  async ngOnInit() {
    const settings = await lastValueFrom(
      this.settingService.getSettings().pipe(take(1))
    );

    this.form.controls.expectedSalary.setValue(settings.salary);
    this.form.controls.overdraft.setValue(settings.overdraft);
    this.form.controls.payCycle.setValue(settings.payCycle);
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
