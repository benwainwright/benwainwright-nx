import { Injectable } from '@angular/core';
import { Models } from '@otters/monzo';
import { filter, BehaviorSubject, map, Observable, of } from 'rxjs';
import { MonzoService } from './monzo.service';

@Injectable({
  providedIn: 'root',
})
export class MonzoAccountsService {
  public mainAccount: Models.Account | undefined;
  private loadedSubject = new BehaviorSubject(false);
  constructor(private monzo: MonzoService) {
    this.monzo.accounts().subscribe((account) => {
      this.mainAccount = account?.data[0];
      this.loadedSubject.next(true);
    });
  }

  getMainAccountDetails() {
    return this.mainAccount;
  }

  public loaded() {
    return this.loadedSubject.pipe(
      map((thing) => {
        return thing;
      }),
      filter((value) => value)
    );
  }
}
