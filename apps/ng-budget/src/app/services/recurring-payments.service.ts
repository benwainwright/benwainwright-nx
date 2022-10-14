import { Inject, Injectable } from '@angular/core';
import { RecurringPayment } from '@benwainwright/budget-domain';
import { Observable, map } from 'rxjs';
import { DataSeriesService } from './data-series.service';

export const PAYMENTS_DATA_INJECTION_TOKEN = 'payments-data-service';

@Injectable({
  providedIn: 'root',
})
export class RecurringPaymentsService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor(
    @Inject(PAYMENTS_DATA_INJECTION_TOKEN)
    private dataService: DataSeriesService<RecurringPayment>
  ) {}

  getPayments(): Observable<RecurringPayment[]> {
    return this.dataService
      .getAll()
      .pipe(
        map((payments) =>
          payments.map((item) => ({ ...item, amount: Number(item.amount) }))
        )
      );
  }

  setPayments(payments: RecurringPayment[]) {
    return this.dataService.setAll(payments);
  }

  updatePayment(payment: RecurringPayment) {
    return this.dataService.updateItem(payment);
  }

  addPayment(payment: RecurringPayment) {
    return this.dataService.insertItem(payment);
  }

  removePayment(payment: RecurringPayment) {
    return this.dataService.removeItem(payment);
  }
}
