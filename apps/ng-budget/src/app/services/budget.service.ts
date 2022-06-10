import { Injectable } from '@angular/core';
import { lastValueFrom, BehaviorSubject, Observable, take } from 'rxjs';
import { uuid } from '../../lib/uuid';
import { parseDates, getNextParsedDate } from '@benwainwright/nl-dates';
import { Budget, PaymentPlan } from '../../types/budget';
import { Pot } from '../../types/pot';
import { PotPlan } from '../../types/pot-plan';
import { RecurringPayment } from '../../types/recurring-payment';
import { BalanceService } from './balance.service';
import { PotsService } from './pots.service';
import { RecurringPaymentsService } from './recurring-payments.service';
import { SettingsService } from './settings.service';

interface InitialBudgetInput {
  startDate: Date;
  endDate: Date;
}

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

  private budgets = new BehaviorSubject<Budget[]>([]);

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

    const startDate = new Date(Date.now());
    const endDate = getNextParsedDate(startDate, settings.payCycle);

    const distributedPayments = this.distributePayments(
      startDate,
      endDate,
      payments,
      pots
    );


    this.updateBudget(uuid(), distributedPayments, balance, startDate, endDate);
  }

  private distributePayments(
    start: Date,
    end: Date,
    payments: RecurringPayment[],
    pots: Pot[]
  ): Omit<PotPlan, 'adjustmentAmount'>[] {
    return pots.map((pot) => ({
      id: pot.id,
      balance: pot.balance,
      name: pot.name,
      payments: payments
        .filter((payment) => payment.potId === pot.id)
        .flatMap((payment) =>
          parseDates(payment.when, {
            from: start,
            to: end,
          }).dates.map((date, index) => ({
            id: `${payment.id}-${index}`,
            name: payment.name,
            when: date,
            amount: payment.amount,
          }))
        ),
    }));
  }

  private hydratePotplanAdjustments(
    potPlans: Omit<PotPlan, 'adjustmentAmount'>[]
  ): PotPlan[] {
    return potPlans.map((plan) => ({
      adjustmentAmount:
        plan.payments.reduce(
          (runningTotal, payment) => runningTotal + payment.amount,
          0
        ) - plan.balance,
      ...plan,
    }));
  }

  private updateBudget(
    id: string,
    payments: Omit<PotPlan, 'adjustmentAmount'>[],
    balance: number,
    startDate: Date,
    endDate: Date
  ) {
    const potPlans = this.hydratePotplanAdjustments(payments);

    const surplus = potPlans.reduce(
      (runningBalance, plan) => runningBalance - plan.adjustmentAmount,
      balance
    );

    const budget = {
      id,
      startDate,
      endDate,
      potPlans,
      surplus,
    };

    const budgets = this.budgets.value;

    const existingBudget = budgets.findIndex((budget) => budget.id === id);
    if (existingBudget !== -1) {
      budgets[existingBudget] = budget;
      this.budgets.next(budgets);
    } else {

      this.budgets.next([...budgets, budget]);
    }
  }

  getBudgets(): Observable<Budget[]> {
    return this.budgets.asObservable();
  }
}
