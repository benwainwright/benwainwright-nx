import { Observable } from "rxjs";

export  interface DataSeriesService<T extends { id: string }> {
  getAll(): Observable<T[]>;
  setAll(data: T[]): Observable<void>;
  insertItem(item: T): Observable<void>;
  updateItem(item: T): Observable<void>
  removeItem(item: T): Observable<void>
}
