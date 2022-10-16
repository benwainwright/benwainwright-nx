import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Budget } from '@benwainwright/budget-domain';
import { BudgetService } from '../services/budget.service';

@Component({
  selector: 'benwainwright-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
})
export class BudgetComponent implements OnInit {
  public budget: Budget | undefined;

  public chips: string[];

  constructor(
    private budgetService: BudgetService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.chips = [];
  }

  availableBalance() {
    const amount = (this.budget?.balance ?? 0) + (this.budget?.potTotals ?? 0);
    return amount;
  }

  deleteBudget(event: Event) {
    this.budget && this.budgetService.deleteBudget(this.budget);
    this.chips = [];
    event.preventDefault();
    this.router.navigate(['/budget-dashboard']);
  }

  ngOnInit(): void {
    this.budgetService.getBudgets().subscribe((budgets) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.budget = budgets.find((budget) => budget.id === id);
      this.chips = [
        ...this.chips,
        this.budget?.isCurrent() ? 'Current' : 'Future',
      ];
    });
  }
}
