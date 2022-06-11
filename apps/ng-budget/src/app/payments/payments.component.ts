import { Component, OnDestroy, OnInit } from '@angular/core';
import { Pot, RecurringPayment } from '@benwainwright/budget-domain';
import { Subscription } from 'rxjs';
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
    private potsService: PotsService
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
