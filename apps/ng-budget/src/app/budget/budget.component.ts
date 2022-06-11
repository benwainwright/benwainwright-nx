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

  constructor(
    private budgetService: BudgetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.budgetService.getBudgets().subscribe((budgets) => {
      const id = this.route.snapshot.paramMap.get('id');
      this.budget = budgets.find((budget) => budget.id === id);
    });
  }
}
