import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackendConfig } from '@benwainwright/types';
import { BehaviorSubject, Observable } from 'rxjs';

const getConfigUrl = () => {
  return `https://quickbudget.co.uk/backend-config.json`;
};

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config = new BehaviorSubject<BackendConfig | undefined>(undefined);

  constructor(private httpClient: HttpClient) {
    this.httpClient.get<BackendConfig>(getConfigUrl()).subscribe((config) => {
      this.config.next(config);
    });
  }

  public getConfig(): Observable<BackendConfig | undefined> {
    return this.config.asObservable();
  }
}
