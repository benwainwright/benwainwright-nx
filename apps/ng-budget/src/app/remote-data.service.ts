import { Inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { filterNullish } from '../lib/filter-nullish';

export const REMOTE_DATA_SERVICE_RESOURCE = 'remote-data-service-resource';

@Injectable({
  providedIn: 'root',
})
export class RemoteDataService<T> implements DataService<T> {
  constructor(
    @Inject(REMOTE_DATA_SERVICE_RESOURCE) private resource: string,
    private api: ApiService,
    private auth: AuthService
  ) {}

  getAll(): Observable<T> {
    return this.auth.getUser().pipe(
      switchMap((user) =>
        this.api.get<T>(
          `${this.resource}/${user?.username}?username=${user?.username}`
        )
      ),
      filterNullish()
    );
  }

  setAll(data: T): Observable<void> {
    return this.auth.getUser().pipe(
      switchMap((user) => {
        return this.api.post<void>(this.resource, {
          body: { ...data, username: user?.username, id: user?.username },
        });
      }),
      filterNullish()
    );
  }
}
