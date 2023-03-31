import { Injectable } from '@angular/core';
import { MonzoResponse, MonzoDataResponse } from '@benwainwright/types';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Models } from '@otters/monzo';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MonzoService {
  constructor(private api: ApiService) {}

  public pots(accountId: string) {
    return this.get<Models.Pot[]>(`/pots/${accountId}`);
  }

  public accounts() {
    return this.get<Models.Account[]>('/accounts');
  }

  public balance(accountId: string) {
    return this.get<Models.Balance>(`/balance/${accountId}`);
  }

  private request<R>(
    ...params: Parameters<typeof this.api.request>
  ): Observable<MonzoDataResponse<R> | undefined> {
    const search = new URLSearchParams(window.location.search);
    const [method, path, body, options] = params;
    const newParams = new HttpParams();
    const withCode = search.get('code')
      ? {
          params: newParams.set('code', search.get('code') ?? ''),
        }
      : {};

    if (withCode) {
      window.history.pushState(
        {},
        document.title,
        '/' +
          window.location.href
            .substring(window.location.href.lastIndexOf('/') + 1)
            .split('?')[0]
      );
    }

    const newOptions = {
      ...(options ?? {}),
      ...withCode,
    };

    const normalisedPath = path.startsWith('/') ? path.slice(1) : path;
    const monzoPath = `/monzo/${normalisedPath}`;

    return this.api
      .request<MonzoResponse<R>>(method, monzoPath, body, newOptions)
      .pipe(
        map((response) => {
          if (response && 'redirectUrl' in response) {
            window.location.href = response.redirectUrl;
          }

          if (response && 'data' in response) {
            return response;
          }

          return undefined;
        })
      );
  }

  private get<R>(path: string, options?: Parameters<typeof this.api.get>[1]) {
    return this.request<R>('GET', path, null, options);
  }

  private post<R>(
    path: string,
    body?: Parameters<typeof this.api.post>[1],
    options?: Parameters<typeof this.api.post>[2]
  ) {
    return this.request<R>('POST', path, body, options);
  }

  private put<R>(
    path: string,
    body?: Parameters<typeof this.api.put>[1],
    options?: Parameters<typeof this.api.post>[2]
  ) {
    return this.request<R>('PUT', path, body, options);
  }

  private delete<R>(
    path: string,
    options?: Parameters<typeof this.api.delete>[1]
  ) {
    return this.request<R>('DELETE', path, null, options);
  }
}
