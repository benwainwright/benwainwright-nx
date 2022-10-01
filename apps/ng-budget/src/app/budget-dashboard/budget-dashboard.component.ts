import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  public tableColumns: string[] = ['from', 'to', 'starting', 'surplus'];

  constructor(public budgetService: BudgetService, public router: Router) {}

  ngOnInit(): void {
    this.subscription = this.budgetService
      .getBudgets()
      .subscribe((budgets) => {
        console.log(budgets)
          return (this.budgets = budgets);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  clickRow(id: string) {
    this.router.navigate([`/budget/${id}`]);
  }
}
