import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BudgetService } from '../services/budget.service';

@Component({
  selector: 'benwainwright-budget-dashboard',
  templateUrl: './budget-dashboard.component.html',
  styleUrls: ['./budget-dashboard.component.css'],
})
export class BudgetDashboardComponent {
  public budgets = this.budgetService.getBudgets();

  public tableColumns: string[] = ['from', 'to', 'starting', 'surplus'];

  constructor(public budgetService: BudgetService, public router: Router) {}

  createBudget(event: Event) {
    this.budgetService.createBudget().subscribe();
    event.preventDefault();
  }

  clickRow(id: string) {
    this.router.navigate([`/budget/${id}`]);
  }
}
