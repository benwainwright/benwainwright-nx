import { Component, Inject } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { Budget, ConcretePayment } from '@benwainwright/budget-domain';
import { BudgetService } from '../services/budget.service';
import { RecurringPaymentsService } from '../services/recurring-payments.service';

export interface EditPaymentSheetCompoentData {
  payment: ConcretePayment;
  budget: Budget;
}

@Component({
  selector: 'benwainwright-edit-payment-sheet',
  templateUrl: './edit-payment-sheet.component.html',
  styleUrls: ['./edit-payment-sheet.component.css'],
})
export class EditPaymentSheetComponent {
  constructor(
    private payments: RecurringPaymentsService,
    private budgets: BudgetService,
    private bottomSheetRef: MatBottomSheetRef<EditPaymentSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: EditPaymentSheetCompoentData
  ) {}

  editOccurrence(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    this.budgets.editConcretePayment(this.data.payment, this.data.budget);
  }

  editSeries(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    this.payments.openCreateEditDialog(this.data.payment.originalPayment);
  }

  togglePaid(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    this.budgets.togglePaymentPaidStatus(this.data.budget, this.data.payment);
  }

  resetSeries(event: MouseEvent) {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    this.budgets.resetConcretePayment(this.data.payment.id, this.data.budget);
  }
}
