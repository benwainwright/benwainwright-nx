import { Injectable } from '@angular/core';
import { Pot } from '@benwainwright/budget-domain';
import { BehaviorSubject, Observable } from 'rxjs';

export const POTS: Pot[] = [
  {
    id: '0',
    balance: 50,
    name: 'my other cool pot',
  },
  {
    id: '1',
    balance: 105,
    name: 'my cool pot',
  },
  {
    id: '2',
    balance: 205,
    name: 'my other cool pot',
  },
  {
    id: '3',
    balance: 405,
    name: 'my next cool pot',
  },
];

@Injectable({
  providedIn: 'root',
})
export class PotsService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  private pots = new BehaviorSubject<Pot[]>(POTS);

  getPots(): Observable<Pot[]> {
    return this.pots.asObservable();
  }
}
