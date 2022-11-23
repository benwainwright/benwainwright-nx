import { Inject, Injectable } from '@angular/core';
import {
  lastValueFrom,
  Observable,
  take,
  combineLatestWith,
  map,
  switchMap,
} from 'rxjs';
import { uuid } from '../../lib/uuid';
import { getNextParsedDate } from '@benwainwright/nl-dates';
import { BalanceService } from './balance.service';
import { PotsService } from './pots.service';
import { RecurringPaymentsService } from './recurring-payments.service';
import { SettingsService } from './settings.service';
import {
  Budget,
  ConcretePayment,
  Pot,
  RecurringPayment,
  Settings,
} from '@benwainwright/budget-domain';
import { DataSeriesService } from './data-series.service';

export const BUDGET_INJECTION_TOKEN = 'budget-service-data';

type DependentData = [RecurringPayment[], Settings, Pot[], number, Budget[]];

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private dependentData: Observable<DependentData>;
  constructor(
    private recurringPayments: RecurringPaymentsService,
    private pots: PotsService,
    private balance: BalanceService,
    private settings: SettingsService,
    @Inject(BUDGET_INJECTION_TOKEN)
    private dataService: DataSeriesService<Budget>
  ) {
    this.dependentData = this.recurringPayments
      .getPayments()
      .pipe(
        combineLatestWith(
          this.settings.getSettings(),
          this.pots.getPots(),
          this.balance.getAvailableBalance(),
          this.getBudgets()
        )
      );
  }

  createBudget() {
    return this.dependentData.pipe(
      take(1),
      switchMap(([payments, settings, pots, balance, budgets]) => {
        const startDate =
          budgets.length === 0
            ? new Date(Date.now())
            : budgets[budgets.length - 1].endDate;

        const tomorrow = new Date(startDate.valueOf());
        tomorrow.setDate(startDate.getDate() + 1);

        const endDate = getNextParsedDate(tomorrow, settings.payCycle);

        const last =
          budgets.length > 0 ? budgets[budgets.length - 1] : undefined;

        const created = new Budget(
          uuid(),
          startDate,
          endDate,
          pots,
          balance,
          last
        );

        created.setPayments(payments);
        return this.dataService.insertItem(created);
      })
    );
  }

  togglePaymentPaidStatus(budget: Budget, payment: ConcretePayment) {
    budget.togglePaymentPaidStatus(payment);
    this.dataService.updateItem(budget);
  }

  deleteBudget(budget: Budget) {
    this.dataService.removeItem(budget);
  }

  getBudgets(): Observable<Budget[]> {
    return this.dataService.getAll().pipe(
      combineLatestWith(
        this.settings.getSettings(),
        this.pots.getPots(),
        this.balance.getAvailableBalance(),
        this.recurringPayments.getPayments()
      ),
      map(([budgets, settings, pots, balance, payments]) => {
        const newBudgets = [...budgets];

        newBudgets.forEach((budget) => {
          switch (budget.pastPresentOrFuture()) {
            case 'Current':
              budget.balance = balance;
              break;
            case 'Future':
              budget.balance = settings.salary;
              break;
            case 'Past':
              budget.balance = 0;
              break;
          }

          budget.pots = pots;
          budget.setPayments(payments);
        });

        newBudgets.map((budget, index, collection) => {
          const prev = index !== 0 ? collection[index - 1] : undefined;
          budget.previous = prev;
          return budget;
        });

        return newBudgets;
      })
    );
  }
}
