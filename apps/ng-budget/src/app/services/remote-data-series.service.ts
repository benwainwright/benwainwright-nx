import { filter, map, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataSeriesService } from './data-series.service';
import { filterNullish } from '../../lib/filter-nullish';
import { v4 } from 'uuid';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { query } from 'rx-query';

export class RemoteDataSeriesService<T extends { id: string }>
  implements DataSeriesService<T>
{
  constructor(
    private resource: string,
    private api: ApiService,
    private auth: AuthService
  ) {}

  insertItem(item: T): Observable<void> {
    return this.auth.getUser().pipe(
      switchMap((user) => {
        return this.api.post<void>(`${this.resource}/${user?.username}`, {
          body: { ...item, username: user?.username, id: v4() },
        });
      }),
      filterNullish()
    );
  }

  getAll(): Observable<T[]> {
    return this.auth.getUser().pipe(
      switchMap((user) =>
        query(this.resource, user?.username, (username) =>
          this.api.get<{ Count: number; Items: T[]; ScannedCount: number }>(
            `${this.resource}/${username}`
          )
        )
      ),
      filterNullish(),
      filter((response) => response.status === 'success'),
      map((response) => {
        const result = response.data?.Items.map((item) =>
          unmarshall(item)
        ) as T[];
        return result;
      })
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAll(_data: T[]): Observable<void> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateItem(_item: T): Observable<void> {
    throw new Error('Method not implemented.');
  }

  removeItem(_item: T): Observable<void> {
    return this.auth.getUser().pipe(
      switchMap((user) => {
        return this.api.delete<void>(
          `${this.resource}/${user?.username}/id/${_item.id}`
        );
      }),
      filterNullish()
    );
  }
}
