import { Injectable } from '@angular/core';
import { Observable, of, map, switchMap } from 'rxjs';
import { MonzoAccountsService } from './monzo-accounts-service.ts.service';
import { MonzoService } from './monzo.service';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  constructor(
    private monzo: MonzoService,
    private accounts: MonzoAccountsService
  ) {}

  getAvailableBalance(): Observable<number> {
    return this.accounts.loaded().pipe(
      switchMap(() => {
        return this.monzo
          .balance(this.accounts.getMainAccountDetails()?.id ?? '')
          .pipe(
            map((balance) => {
              if (balance) {
                return balance.data.balance / 100;
              }
              return 0;
            })
          );
      })
    );
  }
}
