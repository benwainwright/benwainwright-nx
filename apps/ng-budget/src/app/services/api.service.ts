import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, combineLatestWith, of, switchMap, throwError } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private client: HttpClient,
    private config: AppConfigService,
    private auth: AuthService,
    private logger: LoggerService,
    private snackBar: MatSnackBar
  ) {}

  private openSnackBar(message: string) {
    const bar = this.snackBar.open(message, 'Close');
    bar.onAction().subscribe(() => {
      bar.dismiss();
    });

    setInterval(() => {
      bar.dismiss();
    }, 5000);
  }

  public request<R>(
    method: string,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any | null,
    options: Parameters<typeof this.client.get>[1] | undefined
  ) {
    return this.config.getConfig().pipe(
      combineLatestWith(this.auth.getUser()),
      // debounce(() => timer(1000)),
      switchMap(([config, user]) => {
        this.logger.debug(`fetching ${method} ${path}`);
        if (!config || !user) {
          return of(void 0);
        }

        const normalisedPath = path.startsWith('/') ? path.slice(1) : path;
        const url = `${config?.apiUrl}/${normalisedPath}`;

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: user?.session.getIdToken().getJwtToken(),
        });

        const finalOptions = {
          ...(options ?? {}),
          withCredentials: true,
          body,
        };

        return this.client
          .request<R>(method, url, {
            ...finalOptions,
            headers,
          })
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.log(error);
              const message = error.error.message ?? error.message;
              this.openSnackBar(message);
              return throwError(() => error);
            })
          );
      })
    );
  }

  public get<R>(path: string, options?: Parameters<typeof this.client.get>[1]) {
    return this.request<R>('GET', path, null, options);
  }

  public post<R>(
    path: string,
    body?: Parameters<typeof this.client.post>[1],
    options?: Parameters<typeof this.client.post>[2]
  ) {
    return this.request<R>('POST', path, body, options);
  }

  public put<R>(
    path: string,
    body?: Parameters<typeof this.client.put>[1],
    options?: Parameters<typeof this.client.post>[2]
  ) {
    return this.request<R>('PUT', path, body, options);
  }

  public delete<R>(
    path: string,
    options?: Parameters<typeof this.client.delete>[1]
  ) {
    return this.request<R>('DELETE', path, null, options);
  }
}
