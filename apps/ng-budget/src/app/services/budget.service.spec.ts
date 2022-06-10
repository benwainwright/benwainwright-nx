import { TestBed } from '@angular/core/testing';
import { lastValueFrom, Observable, of, retryWhen, take } from 'rxjs';
import { date } from '../../lib/date';
import { Pot } from '../../types/pot';
import { BalanceService } from './balance.service';
import { getNextParsedDate, parseDates } from '@benwainwright/nl-dates';

import { BudgetService } from './budget.service';
import { PotsService } from './pots.service';
import { RecurringPaymentsService } from './recurring-payments.service';
import { when } from 'jest-when';
import { freezeDateWithJestFakeTimers } from '../../testing-utils/freeze-date';
import { SettingsService } from './settings.service';

jest.mock('@benwainwright/nl-dates');

freezeDateWithJestFakeTimers(1, 6, 2022);

beforeEach(() => {
  jest.resetAllMocks();
});

class MockBalanceService {
  getAvailableBalance(): Observable<number> {
    return of(1200);
  }
}

class MockSettingsService {
  getSettings() {
    return of({
      overdraft: 0,
      payCycle: 'last thursday of every month',
    });
  }
}

class MockPotsService {
  getPots(): Observable<Pot[]> {
    return of([
      {
        id: '0',
        balance: 50,
        name: 'my other cool pot',
      },
      {
        id: '1',
        balance: 105,
        name: 'my cool pot',
      },
      {
        id: '2',
        balance: 205,
        name: 'my other cool pot',
      },
      {
        id: '3',
        balance: 405,
        name: 'my next cool pot',
      },
    ]);
  }
}

class MockRecurringPaymentsService {
  getPayments() {
    return of([
      {
        id: '1',
        name: 'Cleaner',
        when: 'on the 3rd of June',
        amount: 100,
        potId: '0',
      },
      {
        id: '2',
        name: 'Fish',
        when: '6th of June',
        amount: 100,
        potId: '0',
      },
      {
        id: '3',
        name: 'Electricity',
        when: 'every week on wednesday',
        amount: 25,
        potId: '1',
      },
    ]);
  }
}

const bootstrapBudgetService = () => {
  TestBed.configureTestingModule({
    providers: [
      { provide: BalanceService, useClass: MockBalanceService },
      { provide: PotsService, useClass: MockPotsService },
      { provide: SettingsService, useClass: MockSettingsService },
      {
        provide: RecurringPaymentsService,
        useClass: MockRecurringPaymentsService,
      },
    ],
  });

  return TestBed.inject(BudgetService);
};

const expectSameDate = (dateOne: Date, dateTwo: Date) => {
  expect(dateOne.getDate()).toEqual(dateTwo.getDate());
  expect(dateOne.getMonth()).toEqual(dateTwo.getMonth());
  expect(dateOne.getFullYear()).toEqual(dateTwo.getFullYear());
};

describe('BudgetService', () => {
  describe('createBudget', () => {
    it.only('creates a single budget when you call create budget', async () => {
      when(jest.mocked(getNextParsedDate))
        .calledWith(date(1, 6, 2022), 'last thursday of every month')
        .mockReturnValue(date(30, 6, 2022));

      when(jest.mocked(parseDates))
        .calledWith('on the 3rd of June', {
          from: date(1, 6, 2022),
          to: date(30, 6, 2022),
        })
        .mockReturnValue({
          type: 'NumberedWeekdayOfMonth',
          dates: [date(30, 6, 2022)],
          weekDay: 4,
          which: 'last',
        });

      when(jest.mocked(parseDates))
        .calledWith('6th of June', {
          from: date(1, 6, 2022),
          to: date(30, 6, 2022),
        })
        .mockReturnValue({
          type: 'SpecificDateOfYear',
          dates: [date(1, 6, 2022)],
          month: 6,
          day: 1,
        });

      when(jest.mocked(parseDates))
        .calledWith('every week on wednesday', {
          from: date(1, 6, 2022),
          to: date(30, 6, 2022),
        })
        .mockReturnValue({
          type: 'EveryWeek',
          dates: [date(1, 6, 2022)],
          weekDay: 3,
          alternatingNumber: 1,
        });

      const service = bootstrapBudgetService();

      service.createBudget();

      jest.runAllTimers();

      const budgets = await lastValueFrom(service.getBudgets().pipe(take(1)));

      expect(budgets).toHaveLength(1);
    });

    it('creates a second budget when you call create budget a second time', async () => {
      const service = bootstrapBudgetService();

      when(jest.mocked(getNextParsedDate))
        .calledWith(date(1, 6, 2022), 'last thursday of every month')
        .mockReturnValue(date(30, 6, 2022));

      when(jest.mocked(getNextParsedDate))
        .calledWith(date(30, 6, 2022), 'last thursday of every month')
        .mockReturnValue(date(28, 6, 2022));

      service.createBudget();
      service.createBudget();

      const budgetsSecond = await lastValueFrom(
        service.getBudgets().pipe(take(1))
      );

      expect(budgetsSecond).toHaveLength(2);
    });

    it('creates the first budget starting from today and ending on the next payday', async () => {
      const service = bootstrapBudgetService();

      when(jest.mocked(getNextParsedDate))
        .calledWith(date(1, 6, 2022), 'last thursday of every month')
        .mockReturnValue(date(30, 6, 2022));

      when(jest.mocked(getNextParsedDate))
        .calledWith(date(30, 6, 2022), 'last thursday of every month')
        .mockReturnValue(date(28, 7, 2022));

      service.createBudget();
      service.createBudget();

      const budgets = await lastValueFrom(service.getBudgets().pipe(take(1)));

      expect(budgets[0].startDate).toBeSameDayAs(date(1, 6, 2022));
      expect(budgets[0].endDate).toBeSameDayAs(date(30, 6, 2022));
      expect(budgets[1].startDate).toBeSameDayAs(date(30, 6, 2022));
      expect(budgets[1].endDate).toBeSameDayAs(date(28, 7, 2022));
    });

    it('generates the correct payments in the pot plan', async () => {
      const service = bootstrapBudgetService();

      await service.createBudget();

      const budget = await lastValueFrom(service.getBudgets().pipe(take(1)));

      const first = budget[0].potPlans[0];
      expect(first.payments.length).toEqual(2);

      expectSameDate(first.payments[0].when, date(3, 6, 2022));
      expectSameDate(first.payments[1].when, date(6, 6, 2022));

      const second = budget[0].potPlans[1];

      expect(second.payments.length).toEqual(5);

      expectSameDate(second.payments[0].when, date(1, 6, 2022));
      expectSameDate(second.payments[1].when, date(8, 6, 2022));
      expectSameDate(second.payments[2].when, date(15, 6, 2022));
      expectSameDate(second.payments[3].when, date(22, 6, 2022));
      expectSameDate(second.payments[4].when, date(29, 6, 2022));

      expect(second.payments[2].amount).toEqual(25);

      const third = budget[0].potPlans[2];
      expect(third.payments.length).toEqual(0);

      const fourth = budget[0].potPlans[2];
      expect(fourth.payments.length).toEqual(0);
    });

    it('calculates the correct pot plan balances', async () => {
      const service = bootstrapBudgetService();

      await service.createBudget();

      const budget = await lastValueFrom(service.getBudgets().pipe(take(1)));

      expect(budget[0].potPlans[0].adjustmentAmount).toEqual(150);
      expect(budget[0].potPlans[1].adjustmentAmount).toEqual(20);
      expect(budget[0].potPlans[2].adjustmentAmount).toEqual(-205);
      expect(budget[0].potPlans[3].adjustmentAmount).toEqual(-405);
      expect(budget[0].surplus).toEqual(1640);
    });
  });
});
