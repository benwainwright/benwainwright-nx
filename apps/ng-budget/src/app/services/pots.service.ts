import { Injectable } from '@angular/core';
import { Pot } from '@benwainwright/budget-domain';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PotsService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  private pots = new BehaviorSubject<Pot[]>([]);

  getPots(): Observable<Pot[]> {
    return this.pots.asObservable();
  }
}
