import { Inject, Injectable } from '@angular/core';
import { Pot } from '@benwainwright/budget-domain';
import { map, Observable } from 'rxjs';
import { DataSeriesService } from './data-series.service';

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
  constructor(@Inject(POTS_INJECTION_TOKEN) private dataService: DataSeriesService<Pot>) {}
  getPots(): Observable<Pot[]> {
    return this.dataService.getAll().pipe(map(pots => pots.map(item => ({...item, balance: Number(item.balance)}))))
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
