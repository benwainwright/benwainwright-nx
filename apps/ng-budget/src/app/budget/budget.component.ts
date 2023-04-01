import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Budget } from '@benwainwright/budget-domain';
import { combineLatestWith, firstValueFrom, map } from 'rxjs';
import { filterNullish } from '../../lib/filter-nullish';
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
    private router: Router
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
