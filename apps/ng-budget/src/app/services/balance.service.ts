import { Injectable } from '@angular/core';
import { Observable, map, switchMap, BehaviorSubject } from 'rxjs';
import { MonzoAccountsService } from './monzo-accounts-service.ts.service';
import { MonzoService } from './monzo.service';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private balance = new BehaviorSubject<number>(0);
  constructor(
    private monzo: MonzoService,
    private accounts: MonzoAccountsService
  ) {
    this.accounts
      .loaded()
      .pipe(
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
      )
      .subscribe((response) => {
        this.balance.next(response);
      });
  }

  updateBalance(balance: number) {
    this.balance.next(balance);
  }

  reduceBalance(reduceBy: number) {
    this.balance.next(this.balance.value - reduceBy);
  }

  increaseBalance(increaseBy: number) {
    this.balance.next(this.balance.value + increaseBy);
  }

  getAvailableBalance(): Observable<number> {
    return this.balance.asObservable();
  }
}
