import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackendConfig } from '@benwainwright/types';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { environment } from '../../environments/environment';

const getConfigUrl = () => {
  if (environment.production) {
    return `/backend-config.json`;
  }
  return `https://quickbudget.co.uk/backend-config.json`;
};

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config = new BehaviorSubject<BackendConfig | undefined>(undefined);

  constructor(private httpClient: HttpClient) {
    this.httpClient.get<BackendConfig>(getConfigUrl()).subscribe((config) => {
      const nextConfig = environment.production
        ? config
        : { ...config, domainName: 'localhost' };
      this.config.next(nextConfig);
    });
  }

  public getConfig(): Observable<BackendConfig | undefined> {
    return this.config.pipe(filter((config) => Boolean(config)));
  }
}
