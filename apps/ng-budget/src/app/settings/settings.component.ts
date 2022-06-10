import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'benwainwright-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnDestroy {
  private subscription: Subscription | undefined;

  public form = new FormGroup({
    overdraft: new FormControl<number>(0, { nonNullable: true }),
    payCycle: new FormControl('', { nonNullable: true }),
    expectedSalary: new FormControl<number>(0, { nonNullable: true }),
  });

  constructor(private settingService: SettingsService) {
    this.subscription = this.form.valueChanges.subscribe((value) =>
      this.settingService.setSettings(value)
    );
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
