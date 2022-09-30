import { Inject, Injectable } from '@angular/core';
import { Pot } from '@benwainwright/budget-domain';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataService } from './data.service';

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

export const POTS_INJECTION_TOKEN = 'pots-data-service'

@Injectable({
  providedIn: 'root',
})
export class PotsService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(@Inject(POTS_INJECTION_TOKEN) private dataService: DataService<Pot>) {}
  getPots(): Observable<Pot[]> {
    return this.dataService.getAll()
  }
  
  setPots(pots: Pot[]) {
    return this.dataService.setAll(pots)
  }

  updatePot(pot: Pot) {
    return this.dataService.updateItem(pot)
  }

  addPot(pot: Pot) {
    return this.dataService.insertItem(pot)
  }

  removePot(pot: Pot) {
    return this.dataService.removeItem(pot)
  }
}
