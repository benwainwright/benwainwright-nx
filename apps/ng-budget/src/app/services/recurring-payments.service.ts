import { Injectable } from '@angular/core';
import { RecurringPayment } from '@benwainwright/budget-domain';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecurringPaymentsService {
  private payments = new BehaviorSubject<RecurringPayment[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor() {}

  getPayments(): Observable<RecurringPayment[]> {
    return this.payments.asObservable();
  }

  setPayments(payments: RecurringPayment[]) {
    this.payments.next(payments);
  }
}
