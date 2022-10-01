import { Inject, Injectable } from '@angular/core';
import { RecurringPayment } from '@benwainwright/budget-domain';
import { Observable, map } from 'rxjs';
import { DataSeriesService } from './data-series.service';

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

export const PAYMENTS_DATA_INJECTION_TOKEN = 'payments-data-service'

@Injectable({
  providedIn: 'root',
})
export class RecurringPaymentsService {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor(@Inject(PAYMENTS_DATA_INJECTION_TOKEN) private dataService: DataSeriesService<RecurringPayment>) {}


  getPayments(): Observable<RecurringPayment[]> {
    return this.dataService.getAll().pipe(map(payments => payments.map(item => ({...item, amount: Number(item.amount)}))))
  }

  setPayments(payments: RecurringPayment[]) {
    return this.dataService.setAll(payments)
  }

  updatePayment(payment: RecurringPayment) {
    return this.dataService.updateItem(payment)
  }

  addPayment(payment: RecurringPayment) {
    return this.dataService.insertItem(payment)
  }

  removePayment(payment: RecurringPayment) {
    return this.dataService.removeItem(payment)
  }
}
