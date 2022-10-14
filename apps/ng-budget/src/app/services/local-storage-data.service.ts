import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataService } from './data.service';

export class LocalStorageDataService<T> implements DataService<T> {
  private data: BehaviorSubject<T>;
  private key: string;

  constructor(key: string) {
    this.key = `ng-budget-${key}`;
    const data: T = JSON.parse(localStorage.getItem(this.key) ?? '{}');
    this.data = new BehaviorSubject<T>(data);
  }

  getAll(): Observable<T> {
    return this.data.asObservable();
  }

  setAll(data: T) {
    localStorage.setItem(this.key, JSON.stringify(data));
    this.data.next(data);
    return of(void 0);
  }
}
