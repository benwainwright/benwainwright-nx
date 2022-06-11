import { Injectable } from '@angular/core';
import { lastValueFrom, BehaviorSubject, Observable, take } from 'rxjs';
import { uuid } from '../../lib/uuid';
import { getNextParsedDate } from '@benwainwright/nl-dates';
import { BalanceService } from './balance.service';
import { PotsService } from './pots.service';
import { RecurringPaymentsService } from './recurring-payments.service';
import { SettingsService } from './settings.service';
import { Budget } from '@benwainwright/budget-domain';

const LOCAL_STORAGE_KEY = 'ng-budget-budgets';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  constructor(
    private recurringPayments: RecurringPaymentsService,
    private pots: PotsService,
    private balance: BalanceService,
    private settings: SettingsService
  ) {}
  private budgets = new BehaviorSubject<Budget[]>(
    JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]')
      .map((item: Budget) => Budget.fromJson(item))
      .map((item: Budget, index: number, collection: Budget[]) => {
        const prev = index !== 0 ? collection[index - 1] : undefined;
        item.previous = prev;
        return item;
      })
  );

  async createBudget() {
    const paymentsPromise = lastValueFrom(
      this.recurringPayments.getPayments().pipe(take(1))
    );

    const settingsPromise = lastValueFrom(
      this.settings.getSettings().pipe(take(1))
    );
    const potsPromise = lastValueFrom(this.pots.getPots().pipe(take(1)));
    const balancePromise = lastValueFrom(
      this.balance.getAvailableBalance().pipe(take(1))
    );

    const [payments, pots, balance, settings] = await Promise.all([
      paymentsPromise,
      potsPromise,
      balancePromise,
      settingsPromise,
    ]);

    const budgets = this.budgets.getValue();

    const startDate =
      budgets.length === 0
        ? new Date(Date.now())
        : budgets[budgets.length - 1].endDate;

    const tomorrow = new Date(startDate.valueOf());
    tomorrow.setDate(startDate.getDate() + 1);

    const endDate = getNextParsedDate(tomorrow, settings.payCycle);

    const last = budgets.length > 0 ? budgets[budgets.length - 1] : undefined;

    const created = new Budget(uuid(), startDate, endDate, pots, balance, last);

    created.setPayments(payments);
    this.saveBudget(created);
  }

  private saveBudget(budget: Budget) {
    const oldBudgets = this.budgets.getValue();
    const newBudgets = [...oldBudgets, budget];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newBudgets));
    this.budgets.next(newBudgets);
  }

  getBudgets(): Observable<Budget[]> {
    return this.budgets.asObservable();
  }
}
