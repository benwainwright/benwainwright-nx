import { Inject, Injectable } from '@angular/core';
import { Pot } from '@benwainwright/budget-domain';
import { map, Observable, switchMap } from 'rxjs';
import { DataSeriesService } from './data-series.service';
import { MonzoAccountsService } from './monzo-accounts-service.ts.service';
import { MonzoService } from './monzo.service';

export const POTS_INJECTION_TOKEN = 'pots-data-service';

@Injectable({
  providedIn: 'root',
})
export class PotsService {
  constructor(
    private accounts: MonzoAccountsService,
    private monzo: MonzoService
  ) {}
  getPots(): Observable<Pot[]> {
    return this.accounts.loaded().pipe(
      switchMap(() => {
        return this.monzo
          .pots(this.accounts.getMainAccountDetails()?.id ?? '')
          .pipe(
            map((response) => {
              if (response) {
                return response.data.map((pot) => ({
                  ...pot,
                  balance: pot.balance / 100,
                }));
              }
              return [];
            })
          );
      })
    );
  }
}
