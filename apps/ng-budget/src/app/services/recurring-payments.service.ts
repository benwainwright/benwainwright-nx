import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecurringPayment } from '@benwainwright/budget-domain';
import { Observable, map } from 'rxjs';
import { v4 } from 'uuid';
import {
  CreatePaymentDialogComponent,
  PaymentDialogData,
} from '../create-payment-dialog/create-payment-dialog.component';
import { DataSeriesService } from './data-series.service';

export const PAYMENTS_DATA_INJECTION_TOKEN = 'payments-data-service';

@Injectable({
  providedIn: 'root',
})
export class RecurringPaymentsService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor(
    @Inject(PAYMENTS_DATA_INJECTION_TOKEN)
    private dataService: DataSeriesService<RecurringPayment>,
    private dialog: MatDialog
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

  openCreateEditDialog(payment?: RecurringPayment, startingPot?: string) {
    const startingData: PaymentDialogData = {
      id: payment?.id ?? v4(),
      end: payment?.end,
      name: payment?.name ?? '',
      amount: payment?.amount ?? 0,
      when: payment?.when ?? '',
      potId: startingPot ?? payment?.potId ?? '',
      new: !payment,
      delete: false,
    };

    const dialogRef = this.dialog.open<
      CreatePaymentDialogComponent,
      PaymentDialogData,
      PaymentDialogData
    >(CreatePaymentDialogComponent, {
      data: startingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.delete) {
        this.removePayment(result).subscribe();
      } else if (result?.new) {
        this.addPayment(result).subscribe();
      } else if (result && !result.new) {
        this.updatePayment(result).subscribe();
      }
    });
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
