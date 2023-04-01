import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Budget, ConcretePayment, PotPlan } from '@benwainwright/budget-domain';
import {
  EditPaymentSheetCompoentData,
  EditPaymentSheetComponent,
} from '../edit-payment-sheet/edit-payment-sheet.component';
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
    private bottomSheet: MatBottomSheet,
    public paymentsService: RecurringPaymentsService
  ) {}

  public tableColumns: string[] = ['name', 'when', 'amount'];

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

  public editPayment(payment: ConcretePayment) {
    this.paymentsService.openCreateEditDialog(payment.originalPayment);
  }

  public editConcretePayment(payment: ConcretePayment) {
    if (this.budget) {
      this.budgets.editConcretePayment(payment, this.budget);
    }
  }

  public openEditSheet(payment: ConcretePayment) {
    if (this.budget) {
      const data: EditPaymentSheetCompoentData = {
        payment,
        budget: this.budget,
      };
      this.bottomSheet.open(EditPaymentSheetComponent, { data });
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
