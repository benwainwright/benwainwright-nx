import { Injectable } from '@angular/core';
import { Pot } from '@benwainwright/budget-domain';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { MonzoAccountsService } from './monzo-accounts-service.ts.service';
import { MonzoService } from './monzo.service';

export const POTS_INJECTION_TOKEN = 'pots-data-service';

@Injectable({
  providedIn: 'root',
})
export class PotsService {
  private pots = new BehaviorSubject<Pot[]>([]);

  constructor(
    private accounts: MonzoAccountsService,
    private monzo: MonzoService
  ) {
    this.accounts
      .loaded()
      .pipe(
        switchMap(() => {
          return this.monzo.pots(
            this.accounts.getMainAccountDetails()?.id ?? ''
          );
        })
      )
      .subscribe((response) => {
        if (response) {
          const pots = response.data.map((pot) => ({
            ...pot,
            balance: pot.balance / 100,
          }));
          this.pots.next(pots);
        }
        return [];
      });
  }

  updatePot(pot: Pot) {
    console.log(`Updating with ${JSON.stringify(pot)}`);
    const index = this.pots.value.findIndex((needle) => pot.id === needle.id);
    const newPots = [...this.pots.value];
    newPots[index] = pot;
    this.pots.next(newPots);
  }

  getPots(): Observable<Pot[]> {
    return this.pots.asObservable();
  }
}
