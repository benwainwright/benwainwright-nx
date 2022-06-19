import { TestBed } from '@angular/core/testing';
import { lastValueFrom, Observable, of, take } from 'rxjs';
import { date } from '../../lib/date';
import { BalanceService } from './balance.service';
import { getNextParsedDate, parseDates } from '@benwainwright/nl-dates';

import { BudgetService } from './budget.service';
import { PotsService } from './pots.service';
import { RecurringPaymentsService } from './recurring-payments.service';
import { when } from 'jest-when';
import { freezeDateWithJestFakeTimers } from '../../testing-utils/freeze-date';
import { SettingsService } from './settings.service';
import { Pot } from '@benwainwright/budget-domain';

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

const POTS: Pot[] = [
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
];

const bootstrapBudgetService = () => {
  const payments = mock<RecurringPaymentsService>();
  payments.getPayments.mockReturnValue(of(PAYMENTS));

  const pots = mock<PotsService>();
  pots.getPots.mockReturnValue(of(POTS));

  const balance = mock<BalanceService>();
  balance.getAvailableBalance.mockReturnValue(of(1200));

  const settings = mock<SettingsService>();
  settings.getSettings.mockReturnValue(
    of({
      overdraft: 0,
      payCycle: 'last thursday of every month',
      payAmount: 1000,
    })
  );

  return new BudgetService(payments, pots, balance, settings);
};

const setupDateMocks = () => {
  when(jest.mocked(getNextParsedDate))
    .calledWith(
      when.allArgs(
        (args) =>
          isSameDate(args[0], date(2, 6, 2022)) &&
          args[1] === 'last thursday of every month'
      )
    )
    .mockReturnValue(date(30, 6, 2022));

  when(jest.mocked(parseDates))
    .calledWith(
      when.allArgs(
        (args) =>
          args[0] === 'on the 3rd of June' &&
          args[1]?.from !== undefined &&
          isSameDate(args[1]?.from, date(1, 6, 2022)) &&
          isSameDate(args[1]?.to, date(30, 6, 2022))
      )
    )
    .mockReturnValue({
      type: 'SpecificDateOfYear',
      dates: [date(30, 6, 2022)],
      day: 3,
      month: 6,
    });

  when(jest.mocked(parseDates))
    .calledWith(
      when.allArgs(
        (args) =>
          args[0] === '6th of June' &&
          args[1]?.from !== undefined &&
          isSameDate(args[1]?.from, date(1, 6, 2022)) &&
          isSameDate(args[1]?.to, date(30, 6, 2022))
      )
    )
    .mockReturnValue({
      type: 'SpecificDateOfYear',
      dates: [date(1, 6, 2022)],
      month: 6,
      day: 6,
    });

  when(jest.mocked(parseDates))
    .calledWith(
      when.allArgs(
        (args) =>
          args[0] === 'every week on wednesday' &&
          args[1]?.from !== undefined &&
          isSameDate(args[1]?.from, date(1, 6, 2022)) &&
          isSameDate(args[1]?.to, date(30, 6, 2022))
      )
    )
    .mockReturnValue({
      type: 'EveryWeek',
      dates: [
        date(1, 6, 2022),
        date(8, 6, 2022),
        date(15, 6, 2022),
        date(22, 6, 2022),
        date(29, 6, 2022),
      ],
      weekDay: 3,
      alternatingNumber: 1,
    });

  when(jest.mocked(getNextParsedDate))
    .calledWith(
      when.allArgs(
        (args) =>
          isSameDate(args[0], date(1, 7, 2022)) &&
          args[1] === 'last thursday of every month'
      )
    )
    .mockReturnValue(date(28, 7, 2022));

  when(jest.mocked(parseDates))
    .calledWith(
      when.allArgs(
        (args) =>
          args[0] === 'on the 3rd of June' &&
          args[1]?.from !== undefined &&
          isSameDate(args[1]?.from, date(30, 6, 2022)) &&
          isSameDate(args[1]?.to, date(28, 7, 2022))
      )
    )
    .mockReturnValue({
      type: 'SpecificDateOfYear',
      dates: [],
      day: 3,
      month: 6,
    });

  when(jest.mocked(parseDates))
    .calledWith(
      when.allArgs(
        (args) =>
          args[0] === '6th of June' &&
          args[1]?.from !== undefined &&
          isSameDate(args[1]?.from, date(30, 6, 2022)) &&
          isSameDate(args[1]?.to, date(28, 7, 2022))
      )
    )
    .mockReturnValue({
      type: 'SpecificDateOfYear',
      dates: [],
      month: 6,
      day: 1,
    });

  when(jest.mocked(parseDates))
    .calledWith(
      when.allArgs(
        (args) =>
          args[0] === 'every week on wednesday' &&
          args[1]?.from !== undefined &&
          isSameDate(args[1]?.from, date(30, 6, 2022)) &&
          isSameDate(args[1]?.to, date(28, 7, 2022))
      )
    )
    .mockReturnValue({
      type: 'EveryWeek',
      dates: [
        date(6, 6, 2022),
        date(13, 6, 2022),
        date(20, 6, 2022),
        date(27, 6, 2022),
      ],
      weekDay: 3,
      alternatingNumber: 1,
    });
};

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

describe('BudgetService', () => {
  describe('createBudget', () => {
    it('creates a single budget when you call create budget', async () => {
      setupDateMocks();

      const service = bootstrapBudgetService();

      await service.createBudget();

      const budgets = await lastValueFrom(service.getBudgets().pipe(take(1)));

      expect(budgets).toHaveLength(1);
    });

    it('creates a second budget when you call create budget a second time', async () => {
      setupDateMocks();

      const service = bootstrapBudgetService();

      await service.createBudget();
      await service.createBudget();

      const budgetsSecond = await lastValueFrom(
        service.getBudgets().pipe(take(1))
      );

      expect(budgetsSecond).toHaveLength(2);
    });

    it('creates the first budget starting from today and ending on the next payday, then the next budget following that', async () => {
      setupDateMocks();
      const service = bootstrapBudgetService();

      await service.createBudget();
      await service.createBudget();

      const budgets = await lastValueFrom(service.getBudgets().pipe(take(1)));

      expect(budgets[0].startDate).toBeSameDayAs(date(1, 6, 2022));
      expect(budgets[0].endDate).toBeSameDayAs(date(30, 6, 2022));
      expect(budgets[1].startDate).toBeSameDayAs(date(30, 6, 2022));
      expect(budgets[1].endDate).toBeSameDayAs(date(28, 7, 2022));
    });

    it('passes in pots and balance correctly', async () => {
      setupDateMocks();
      const service = bootstrapBudgetService();

      await service.createBudget();
      await service.createBudget();

      const budgets = await lastValueFrom(service.getBudgets().pipe(take(1)));

      expect(budgets[0].pots).toEqual(POTS);

      expect(budgets[1].pots).toEqual(
        POTS.map((pot) => ({ ...pot, balance: 0 }))
      );
    });

    it('links together subsequent budgets', async () => {
      setupDateMocks();
      const service = bootstrapBudgetService();

      await service.createBudget();
      await service.createBudget();

      const budgets = await lastValueFrom(service.getBudgets().pipe(take(1)));

      expect(budgets[0].previous).toBeUndefined();
      expect(budgets[1].previous).toEqual(budgets[0]);
    });
  });
});
