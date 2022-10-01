import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Budget } from '@benwainwright/budget-domain';
import { BudgetService } from '../services/budget.service';

@Component({
  selector: 'benwainwright-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
})
export class BudgetComponent implements OnInit {
  public budget: Budget | undefined;

  public chips: string[]

  constructor(
    private budgetService: BudgetService,
    private route: ActivatedRoute
  ) {
    this.chips = []
  }

  availableBalance() {
    const amount = (this.budget?.balance ?? 0) + (this.budget?.potTotals ?? 0);
    return amount
  }

  ngOnInit(): void {
    this.budgetService.getBudgets().subscribe((budgets) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.budget = budgets.find((budget) => budget.id === id);
      this.chips = [...this.chips, this.budget?.isCurrent() ? "Current" : "Future"]
    });
  }
}
