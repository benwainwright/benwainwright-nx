import { Component } from '@angular/core';
import { Pot, RecurringPayment } from '@benwainwright/budget-domain';
import { combineLatestWith, map } from 'rxjs';
import { PotsService } from '../services/pots.service';
import { RecurringPaymentsService } from '../services/recurring-payments.service';

@Component({
  selector: 'benwainwright-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent {
  constructor(
    public paymentsService: RecurringPaymentsService,
    private potsService: PotsService
  ) {}

  public pots: Pot[] = [];

  public tableColumns = ['name', 'amount', 'when', 'pot'];

  public paymentsSubscription = this.potsService
    .getPots()
    .pipe(combineLatestWith(this.paymentsService.getPayments()))
    .pipe(
      map(([pots, payments]) => {
        this.pots = pots;
        return payments;
      })
    );

  getPot(payment: RecurringPayment): Pot | undefined {
    return this.pots.find((pot) => pot.id === payment.potId);
  }
}
