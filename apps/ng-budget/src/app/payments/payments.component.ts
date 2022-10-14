import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Pot, RecurringPayment } from '@benwainwright/budget-domain';
import { Subscription } from 'rxjs';
import { v4 } from 'uuid';
import {
  CreatePaymentDialogComponent,
  PaymentDialogData,
} from '../create-payment-dialog/create-payment-dialog.component';
import { PotsService } from '../services/pots.service';
import { RecurringPaymentsService } from '../services/recurring-payments.service';

@Component({
  selector: 'benwainwright-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit, OnDestroy {
  constructor(
    private paymentsService: RecurringPaymentsService,
    private potsService: PotsService,
    private dialog: MatDialog
  ) {}

  public payments: RecurringPayment[] = [];
  public pots: Pot[] = [];

  public tableColumns = ['name', 'amount', 'when', 'pot'];

  private paymentsSubscription: Subscription | undefined;
  private potsSubscription: Subscription | undefined;

  ngOnDestroy(): void {
    this.paymentsSubscription?.unsubscribe();
    this.potsSubscription?.unsubscribe();
  }

  openCreateEditDialog(payment?: RecurringPayment) {
    const startingData: PaymentDialogData = {
      id: payment?.id ?? v4(),
      name: payment?.name ?? '',
      amount: payment?.amount ?? 0,
      when: payment?.when ?? '',
      potId: payment?.potId ?? '',
      new: !payment,
    };

    const dialogRef = this.dialog.open<
      CreatePaymentDialogComponent,
      PaymentDialogData,
      PaymentDialogData
    >(CreatePaymentDialogComponent, {
      data: startingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.new) {
        this.paymentsService.addPayment(result).subscribe();
      } else if (result && !result.new) {
        this.paymentsService.updatePayment(result).subscribe();
      }
    });
  }

  getPot(payment: RecurringPayment): Pot | undefined {
    return this.pots.find((pot) => pot.id === payment.potId);
  }

  ngOnInit(): void {
    this.potsSubscription = this.potsService
      .getPots()
      .subscribe((pots) => (this.pots = pots));

    this.paymentsSubscription = this.paymentsService
      .getPayments()
      .subscribe((payments) => (this.payments = payments));
  }
}
