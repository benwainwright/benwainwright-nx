import { Inject, Injectable } from '@angular/core';
import {
  take,
  combineLatestWith,
  map,
  switchMap,
  firstValueFrom,
  Observable,
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
  PotPlan,
  RecurringPayment,
  Settings,
} from '@benwainwright/budget-domain';
import { DataSeriesService } from './data-series.service';
import { MonzoAccountsService } from './monzo-accounts-service.ts.service';
import { MonzoService } from './monzo.service';
import { MatDialog } from '@angular/material/dialog';
import {
  BalancePotsDialogComponent,
  BalancePotsDialogData,
} from '../balance-pots-dialog/balance-pots-dialog.component';
import {
  EditConcretePaymentDialogComponent,
  EditConcretePaymentDialogData,
} from '../edit-concrete-payment/edit-concrete-payment.component';

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
    private dataService: DataSeriesService<Budget>,
    private account: MonzoAccountsService,
    private potsService: PotsService,
    private monzo: MonzoService,
    private dialog: MatDialog
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

  openBalancePotsDialog(budget: Budget) {
    const deposits = budget.potPlans.filter((pot) => pot.adjustmentAmount > 0);

    const withdrawals = budget.potPlans.filter(
      (pot) => pot.adjustmentAmount < 0
    );

    const data = {
      withdrawals,
      deposits,
    };

    this.dialog.open<BalancePotsDialogComponent, BalancePotsDialogData>(
      BalancePotsDialogComponent,
      {
        data,
      }
    );
  }

  async balancePot(pot: PotPlan) {
    const mainAccountId = this.account.getMainAccountDetails()?.id;
    if (pot.adjustmentAmount < 0) {
      const resultingPot = await firstValueFrom(
        this.monzo.withDrawFromPot({
          potId: pot.id,
          destinationAccount: mainAccountId ?? '',
          amount: Math.round(Math.abs(pot.adjustmentAmount) * 100),
        })
      );

      this.balance.increaseBalance(pot.adjustmentAmount);
      if (resultingPot) {
        this.potsService.updatePot(resultingPot.data);
      }
    }

    if (pot.adjustmentAmount > 0) {
      const resultingPot = await firstValueFrom(
        this.monzo.depositIntoPot({
          potId: pot.id,
          sourceAccount: mainAccountId ?? '',
          amount: Math.round(Math.abs(pot.adjustmentAmount) * 100),
        })
      );

      this.balance.reduceBalance(pot.adjustmentAmount);
      if (resultingPot) {
        this.potsService.updatePot(resultingPot.data);
      }
    }
  }

  async balancePots(budget: Budget) {
    const mainAccountId = this.account.getMainAccountDetails()?.id;
    await budget.potPlans
      .filter((pot) => pot.adjustmentAmount < 0)
      .reduce(async (promise, nextPot) => {
        await promise;
        const pot = await firstValueFrom(
          this.monzo.withDrawFromPot({
            potId: nextPot.id,
            destinationAccount: mainAccountId ?? '',
            amount: Math.round(Math.abs(nextPot.adjustmentAmount) * 100),
          })
        );
        if (pot) {
          this.potsService.updatePot(pot.data);
        }
      }, Promise.resolve());

    await budget.potPlans
      .filter((pot) => pot.adjustmentAmount > 0)
      .reduce(async (promise, nextPot) => {
        await promise;
        const pot = await firstValueFrom(
          this.monzo.depositIntoPot({
            potId: nextPot.id,
            sourceAccount: mainAccountId ?? '',
            amount: Math.round(Math.abs(nextPot.adjustmentAmount) * 100),
          })
        );
        if (pot) {
          this.potsService.updatePot(pot.data);
        }
      }, Promise.resolve());
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

  editConcretePayment(payment: ConcretePayment, budget: Budget) {
    const startingData: EditConcretePaymentDialogData = {
      ...payment,
      new: false,
      delete: false,
    };

    const dialogRef = this.dialog.open<
      EditConcretePaymentDialogComponent,
      EditConcretePaymentDialogData,
      EditConcretePaymentDialogData
    >(EditConcretePaymentDialogComponent, {
      data: startingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        budget.editConcretePayment(result);
      }
      this.dataService.updateItem(budget);
    });
  }

  resetConcretePayment(id: string, budget: Budget) {
    budget.resetConcretePayment(id);
    this.dataService.updateItem(budget);
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
