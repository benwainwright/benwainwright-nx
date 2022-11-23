import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Budget } from '@benwainwright/budget-domain';
import { take, combineLatestWith } from 'rxjs';
import { BudgetService } from '../services/budget.service';
import { RecurringPaymentsService } from '../services/recurring-payments.service';

@Component({
  selector: 'benwainwright-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
})
export class BudgetComponent implements OnInit {
  public budget: Budget | undefined;

  public chips: Set<string>;

  constructor(
    private budgetService: BudgetService,
    private route: ActivatedRoute,
    private paymentsService: RecurringPaymentsService,
    private router: Router
  ) {
    this.chips = new Set();
  }

  availableBalance() {
    const amount = (this.budget?.balance ?? 0) + (this.budget?.potTotals ?? 0);
    return amount;
  }

  deleteBudget(event: Event) {
    this.budget && this.budgetService.deleteBudget(this.budget);
    event.preventDefault();
    this.router.navigate(['/budget-dashboard']);
  }

  ngOnInit(): void {
    this.budgetService
      .getBudgets()
      .pipe(combineLatestWith(this.paymentsService.getPayments()), take(1))
      .subscribe(([budgets]) => {
        const id = this.route.snapshot.paramMap.get('id');
        this.budget = budgets.find((budget) => budget.id === id);
        this.chips.delete('Current');
        this.chips.delete('Future');
        this.chips.delete('Past');
        this.chips.add(this.budget?.pastPresentOrFuture() as string);
      });
  }
}
