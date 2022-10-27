import { Component, Input, OnInit } from '@angular/core';
import { Budget, ConcretePayment, PotPlan } from '@benwainwright/budget-domain';
import { BudgetService } from '../services/budget.service';
import { RecurringPaymentsService } from '../services/recurring-payments.service';

@Component({
  selector: 'benwainwright-pot',
  templateUrl: './pot.component.html',
  styleUrls: ['./pot.component.css'],
})
export class PotComponent {
  @Input()
  public pot: PotPlan | undefined;

  @Input()
  public budget: Budget | undefined;

  @Input()
  public isFuture: boolean | undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor(
    private budgets: BudgetService,
    public paymentsService: RecurringPaymentsService
  ) {}

  public tableColumns: string[] = ['name', 'when', 'amount', 'actions'];

  public get backgroundClass(): string {
    if (!this.pot) {
      return '';
    }
    if (this.isFuture) {
      return '';
    }

    if (this.pot.adjustmentAmount > 0.0001) {
      return 'pot-deficit';
    }

    if (this.pot.adjustmentAmount < -0.0001) {
      return 'pot-surplus';
    }

    return '';
  }

  public togglePaymentPaidStatus(payment: ConcretePayment) {
    if (this.budget) {
      this.budgets.togglePaymentPaidStatus(this.budget, payment);
    }
  }

  public get allocated(): number {
    return (
      (this.pot?.adjustmentAmount ?? 0) +
      (this.pot?.balance ?? 0) +
      (this.pot?.totalPaid ?? 0)
    );
  }
}
