import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { Budget, ConcretePayment } from '@benwainwright/budget-domain';
import { combineLatestWith, firstValueFrom, map } from 'rxjs';
import { filterNullish } from '../../lib/filter-nullish';
import {
  EditPaymentSheetCompoentData,
  EditPaymentSheetComponent,
} from '../edit-payment-sheet/edit-payment-sheet.component';
import { BudgetService } from '../services/budget.service';
import { RecurringPaymentsService } from '../services/recurring-payments.service';

@Component({
  selector: 'benwainwright-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
})
export class BudgetComponent {
  public budgetObservable = this.budgetService.getBudgets().pipe(
    combineLatestWith(this.paymentsService.getPayments()),
    map(([budgets]) => {
      const id = this.route.snapshot.paramMap.get('id');
      const newBudget = budgets.find((budget) => budget.id === id);
      return newBudget;
    }),
    filterNullish()
  );

  public budget: Budget | undefined;

  public plannedTransactionsCols = ['name', 'amount', 'date', 'pot'];

  public potPlans = this.budgetObservable.pipe(
    map((budget) => {
      return budget.potPlans.filter((pot) => {
        return !(
          pot.balance === 0 &&
          pot.payments.length === 0 &&
          pot.totalPaid === 0 &&
          pot.adjustmentAmount === 0
        );
      });
    })
  );

  public plannedTransactions = this.potPlans.pipe(
    map((potPlan) => {
      return potPlan
        .flatMap((potPlan) =>
          potPlan.payments.map((payment) => ({ ...payment, pot: potPlan }))
        )
        .slice()
        .sort((a, b) => (a.when > b.when ? 1 : -1));
    })
  );

  public availableBalance = this.budgetObservable.pipe(
    map((budget) => {
      const amount = (budget?.balance ?? 0) + (budget?.potTotals ?? 0);
      return amount;
    })
  );

  public potTotals: number | undefined;

  public chips: Set<string>;

  constructor(
    private budgetService: BudgetService,
    private route: ActivatedRoute,
    private paymentsService: RecurringPaymentsService,
    private router: Router,
    private bottomSheet: MatBottomSheet
  ) {
    this.chips = new Set();
    this.budgetObservable.subscribe((budget) => {
      this.budget = budget;
      this.chips.delete('Current');
      this.chips.delete('Future');
      this.chips.delete('Past');
      this.chips.add(budget?.pastPresentOrFuture() as string);
    });
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

  public togglePaymentPaidStatus(payment: ConcretePayment) {
    if (this.budget) {
      this.budgetService.togglePaymentPaidStatus(this.budget, payment);
    }
  }

  public editPayment(payment: ConcretePayment) {
    if (this.budget) {
      this.paymentsService.openCreateEditDialog(payment.originalPayment);
    }
  }

  async balancePots() {
    const budget = await firstValueFrom(this.budgetObservable);
    this.budgetService.openBalancePotsDialog(budget);
  }

  async deleteBudget(event: Event) {
    const budget = await firstValueFrom(this.budgetObservable);
    this.budgetService.deleteBudget(budget);
    event.preventDefault();
    this.router.navigate(['/budget-dashboard']);
  }
}
