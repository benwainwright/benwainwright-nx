import { Component, OnDestroy, OnInit } from '@angular/core';
import { Budget } from '@benwainwright/budget-domain';
import { Subscription } from 'rxjs';
import { BudgetService } from '../services/budget.service';

@Component({
  selector: 'benwainwright-budget-dashboard',
  templateUrl: './budget-dashboard.component.html',
  styleUrls: ['./budget-dashboard.component.css'],
})
export class BudgetDashboardComponent implements OnInit, OnDestroy {
  public budgets: Budget[] = [];

  public subscription: Subscription | undefined;

  constructor(public budgetService: BudgetService) {}

  ngOnInit(): void {
    this.subscription = this.budgetService
      .getBudgets()
      .subscribe((budgets) => (this.budgets = budgets));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
