import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface Settings {
  overdraft: number;
  payCycle: string;
  payAmount: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  private settings = new BehaviorSubject<Settings>({
    overdraft: 0,
    payCycle: 'last thursday of every month',
    payAmount: 0,
  });

  getSettings(): Observable<Settings> {
    return this.settings.asObservable();
  }

  setSettings(settings: Partial<Settings>) {
    const nextSettings = { ...this.settings.value, ...settings };
    this.settings.next(nextSettings);
  }
}
