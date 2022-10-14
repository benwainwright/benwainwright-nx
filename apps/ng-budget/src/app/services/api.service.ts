import { HttpClient, HttpHeaders } from '@angular/common/http';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { Injectable } from '@angular/core';
import { timer, debounce, combineLatestWith, of, switchMap, map } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private client: HttpClient,
    private config: AppConfigService,
    private auth: AuthService
  ) {}

  private request<R>(
    method: string,
    path: string,
    options: Parameters<typeof this.client.get>[1] | undefined
  ) {
    return this.config.getConfig().pipe(
      combineLatestWith(this.auth.getUser()),
      // debounce(() => timer(1000)),
      switchMap(([config, user]) => {
        if (!config || !user) {
          return of(void 0);
        }
        const normalisedPath = path.startsWith('/') ? path.slice(1) : path;
        const url = `${config?.apiUrl}/${normalisedPath}`;

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: user?.session.getIdToken().getJwtToken(),
        });

        const finalOptions = { ...(options ?? {}), withCredentials: true };

        return this.client.request<R>(method, url, {
          ...finalOptions,
          headers,
        });
      })
    );
  }

  public get<R>(path: string, options?: Parameters<typeof this.client.get>[1]) {
    return this.request<R>('GET', path, options);
  }

  public post<R>(
    path: string,
    options?: Parameters<typeof this.client.post>[1]
  ) {
    return this.request<R>('POST', path, options);
  }

  public put<R>(path: string, options: Parameters<typeof this.client.post>[1]) {
    return this.request<R>('PUT', path, options);
  }

  public delete<R>(
    path: string,
    options?: Parameters<typeof this.client.post>[1]
  ) {
    return this.request<R>('DELETE', path, options);
  }
}
