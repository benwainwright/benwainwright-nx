import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private balance = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getAvailableBalance(): Observable<number> {
    return of(this.balance);
  }
}
