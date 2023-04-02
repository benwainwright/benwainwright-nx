import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DataService } from './data.service';
import { Settings } from '@benwainwright/budget-domain';

export const SETTINGS_INJECTION_TOKEN = 'settings-data-service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settings: Settings = {
    overdraft: 0,
    payCycle: 'last thursday of every month',
    salary: 0,
    username: '',
    id: '',
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    @Inject(SETTINGS_INJECTION_TOKEN) private dataService: DataService<Settings>
  ) {
    this.dataService
      .getAll()
      .subscribe((settings) => (this.settings = settings));
  }

  getSettings(): Observable<Settings> {
    return this.dataService.getAll().pipe(
      map((value) => {
        return {
          ...value,
          overdraft: value.overdraft && Number(value.overdraft),
          salary: value.salary && Number(value.salary),
        };
      }),
      map((value) => ({ ...this.settings, ...value }))
    );
  }

  setSettings(settings: Partial<Settings>) {
    return this.dataService.setAll({ ...this.settings, ...settings });
  }
}
