import { Injectable } from '@angular/core';
import { RecurringPayment } from '@benwainwright/budget-domain';
import { Observable, BehaviorSubject } from 'rxjs';

export const PAYMENTS: RecurringPayment[] = [
  {
    id: '1',
    name: 'Cleaner',
    when: 'on the 3rd of June',
    amount: 100,
    potId: '0',
  },
  {
    id: '2',
    name: 'Fish',
    when: '25th of June',
    amount: 100,
    potId: '0',
  },
  {
    id: '3',
    name: 'Electricity',
    when: 'every week on wednesday',
    amount: 25,
    potId: '1',
  },
];

@Injectable({
  providedIn: 'root',
})
export class RecurringPaymentsService {
  private payments = new BehaviorSubject<RecurringPayment[]>(PAYMENTS);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor() {}

  getPayments(): Observable<RecurringPayment[]> {
    return this.payments.asObservable();
  }

  setPayments(payments: RecurringPayment[]) {
    this.payments.next(payments);
  }
}
