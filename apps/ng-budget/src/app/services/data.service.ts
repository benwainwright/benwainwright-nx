import { Observable } from 'rxjs';

export interface DataService<T> {
  getAll(): Observable<T>;
  setAll(data: T): void;
}
