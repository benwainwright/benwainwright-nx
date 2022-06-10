import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface Settings {
  overdraft: number;
  payCycle: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {}

  private settings = new BehaviorSubject<Settings>({
    overdraft: 0,
    payCycle: 'on the first of every month',
  });

  getSettings(): Observable<Settings> {
    return this.settings.asObservable();
  }

  setSettings(settings: Partial<Settings>) {
    const nextSettings = { ...this.settings.value, ...settings };
    this.settings.next(nextSettings);
  }
}
