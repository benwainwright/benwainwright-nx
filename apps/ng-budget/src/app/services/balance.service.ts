import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  constructor(private settings: SettingsService) {}

  getAvailableBalance(): Observable<number> {
    return this.settings
      .getSettings()
      .pipe(map((settings) => settings.balance));
  }
}
