import { Inject, Injectable } from '@angular/core';
import { filter, map, Observable, switchMap } from 'rxjs';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { filterNullish } from '../lib/filter-nullish';
import { REMOTE_DATA_SERVICE_RESOURCE } from './services/remote-data-service-key';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { Mutator, query, QueryOutput, refreshQuery } from 'rx-query';

@Injectable({
  providedIn: 'root',
})
export class RemoteDataService<T> implements DataService<T> {
  private query: Observable<QueryOutput<{ Item: T } | undefined>>;
  private mutate?: Mutator<{ Item: T } | undefined>;

  constructor(
    @Inject(REMOTE_DATA_SERVICE_RESOURCE) private resource: string,
    private api: ApiService,
    private auth: AuthService
  ) {
    this.query = this.auth.getUser().pipe(
      switchMap((user) =>
        query(
          this.resource,
          user?.username,
          (username) => {
            return this.api.get<{ Item: T }>(
              `${this.resource}/${username}/id/${username}`
            );
          },
          {
            mutator: (data, { queryParameters }) => {
              return this.api
                .post<{ Item: T }>(`${this.resource}/${queryParameters}`, {
                  body: data.Item,
                })
                .pipe(map(() => data));
            },
          }
        )
      ),
      filterNullish(),
      filter((response) => {
        this.mutate = response.mutate;
        return response.status === 'success';
      })
    );
  }

  getAll(): Observable<T> {
    return this.query.pipe(
      map((response) => {
        return unmarshall(response.data?.Item ?? {}) as T;
      })
    );
  }

  setAll(data: T): void {
    this.mutate?.({ Item: data });
  }
}
