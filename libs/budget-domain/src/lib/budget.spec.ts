import { parseDates } from '@benwainwright/nl-dates';
import { freezeDateWithJestFakeTimers } from '@benwainwright/test-helpers';
import { date } from '@benwainwright/utils';
import { when } from 'jest-when';
import { Pot } from '../types/pot';
import { RecurringPayment } from '../types/recurring-payment';
import { Budget } from './budget';

freezeDateWithJestFakeTimers(new Date(1654869830 * 1000));

jest.mock('@benwainwright/nl-dates');

const setupDateMocks = (from: Date, to: Date) => {
  when(jest.mocked(parseDates))
    .calledWith('on the 3rd of June', {
      from,
      to,
    })
    .mockReturnValue({
      type: 'NumberedWeekdayOfMonth',
      dates: [date(3, 6, 2022)],
      weekDay: 4,
      which: 'last',
    });

  when(jest.mocked(parseDates))
    .calledWith('6th of June', {
      from,
      to,
    })
    .mockReturnValue({
      type: 'SpecificDateOfYear',
      dates: [date(6, 6, 2022)],
      month: 6,
      day: 1,
    });

  when(jest.mocked(parseDates))
    .calledWith('every week on wednesday', {
      from,
      to,
    })
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
};

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

const PAYMENTS: RecurringPayment[] = [
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
];

describe('budget', () => {
  it('distributes the correct payments into the pot plans', () => {
    const from = date(1, 6, 2022);
    const to = date(30, 6, 2022);

    setupDateMocks(from, to);
    const budget = new Budget('id', from, to, POTS, 1000);

    budget.setPayments(PAYMENTS);

    const first = budget.potPlans[0];
    expect(first.payments.length).toEqual(2);

    expect(first.payments[0].when).toBeSameDayAs(date(3, 6, 2022));
    expect(first.payments[1].when).toBeSameDayAs(date(6, 6, 2022));

    const second = budget.potPlans[1];

    expect(second.payments.length).toEqual(5);

    expect(second.payments[0].when).toBeSameDayAs(date(1, 6, 2022));
    expect(second.payments[1].when).toBeSameDayAs(date(8, 6, 2022));
    expect(second.payments[2].when).toBeSameDayAs(date(15, 6, 2022));
    expect(second.payments[3].when).toBeSameDayAs(date(22, 6, 2022));
    expect(second.payments[4].when).toBeSameDayAs(date(29, 6, 2022));

    expect(second.payments[2].amount).toEqual(25);

    const third = budget.potPlans[2];
    expect(third.payments.length).toEqual(0);

    const fourth = budget.potPlans[2];
    expect(fourth.payments.length).toEqual(0);
  });

  it('assumes pot balances are zero if budget is not current', () => {
    const from = date(1, 6, 2022);
    const to = date(30, 6, 2022);
    const finalTo = date(28, 7, 2022);

    setupDateMocks(from, to);
    setupDateMocks(to, finalTo);

    const budget = new Budget('id', from, to, POTS, 1000);
    budget.setPayments(PAYMENTS);

    const secondBudget = new Budget('id2', to, finalTo, POTS, 1000, budget);
    secondBudget.setPayments(PAYMENTS);

    const first = secondBudget.potPlans[0];
    expect(first.adjustmentAmount).toEqual(200);

    const second = secondBudget.potPlans[1];
    expect(second.adjustmentAmount).toEqual(125);

    const third = secondBudget.potPlans[2];
    expect(third.adjustmentAmount).toEqual(0);

    const fourth = secondBudget.potPlans[3];
    expect(fourth.adjustmentAmount).toEqual(0);
  });

  it('calculates the correct adjustment amounts', () => {
    const from = date(1, 6, 2022);
    const to = date(30, 6, 2022);

    setupDateMocks(from, to);
    const budget = new Budget('id', from, to, POTS, 1000);

    budget.setPayments(PAYMENTS);

    const first = budget.potPlans[0];
    expect(first.adjustmentAmount).toEqual(150);

    const second = budget.potPlans[1];
    expect(second.adjustmentAmount).toEqual(20);

    const third = budget.potPlans[2];
    expect(third.adjustmentAmount).toEqual(-205);

    const fourth = budget.potPlans[3];
    expect(fourth.adjustmentAmount).toEqual(-405);
  });

  it('calculates the correct surplus for the first budget', () => {
    const from = date(1, 6, 2022);
    const to = date(30, 6, 2022);

    setupDateMocks(from, to);
    const budget = new Budget('id', from, to, POTS, 1000);

    budget.setPayments(PAYMENTS);

    expect(budget.surplus).toEqual(1440);
  });

  it('adds previous budget surplus to the current balance', () => {
    const from = date(1, 6, 2022);
    const to = date(30, 6, 2022);
    const finalTo = date(28, 7, 2022);

    setupDateMocks(from, to);
    setupDateMocks(to, finalTo);

    const budget = new Budget('id', from, to, POTS, 1000);
    budget.setPayments(PAYMENTS);

    const secondBudget = new Budget('id2', to, finalTo, POTS, 1000, budget);
    secondBudget.setPayments(PAYMENTS);

    expect(secondBudget.surplus).toEqual(2115);
  });

  it('correctly marks the budget as current or not depending on the date range and the current date', () => {
    const budget = new Budget(
      'id',
      date(1, 6, 2022),
      date(30, 6, 2022),
      POTS,
      1000
    );

    expect(budget.isCurrent()).toEqual(true);

    const budgetTwo = new Budget(
      'id',
      date(20, 6, 2022),
      date(30, 6, 2022),
      POTS,
      1000
    );

    expect(budgetTwo.isCurrent()).toEqual(false);

    const budgetThree = new Budget(
      'id',
      new Date(1654851830 * 1000),
      date(30, 6, 2022),
      POTS,
      1000
    );

    expect(budgetThree.isCurrent()).toEqual(true);

    const budgetFour = new Budget(
      'id',
      new Date(1654884229 * 1000),
      date(30, 6, 2022),
      POTS,
      1000
    );

    expect(budgetFour.isCurrent()).toEqual(true);

    const budgetFive = new Budget(
      'id',
      date(1, 6, 2022),
      new Date(1654898449 * 1000),
      POTS,
      1000
    );

    expect(budgetFive.isCurrent()).toEqual(false);

    const budgetSix = new Budget(
      'id',
      date(1, 6, 2022),
      new Date(1654905649 * 1000),
      POTS,
      1000
    );

    expect(budgetSix.isCurrent()).toEqual(true);
  });

  it('returns all the passed in pots from pots', () => {
    const from = date(1, 6, 2022);
    const to = date(30, 6, 2022);

    const budget = new Budget('id', from, to, POTS, 1000);

    expect(budget.pots).toEqual(POTS);
  });

  it('updating current pot balances updates the current adjustment amounts which is reflected in the final surpluses', () => {
    const from = date(1, 6, 2022);
    const to = date(30, 6, 2022);
    const finalTo = date(28, 7, 2022);

    setupDateMocks(from, to);
    setupDateMocks(to, finalTo);

    const budget = new Budget('id', from, to, POTS, 1000);
    budget.setPayments(PAYMENTS);

    const secondBudget = new Budget('id2', to, finalTo, POTS, 1000, budget);
    secondBudget.setPayments(PAYMENTS);

    budget.pots = [
      {
        id: '0',
        balance: 65,
        name: 'my other cool pot',
      },
      {
        id: '1',
        balance: 105,
        name: 'my cool pot',
      },
      {
        id: '2',
        balance: 180,
        name: 'my other cool pot',
      },
      {
        id: '3',
        balance: 405,
        name: 'my next cool pot',
      },
    ];

    expect(budget.potPlans[0].adjustmentAmount).toEqual(135);
    expect(budget.potPlans[1].adjustmentAmount).toEqual(20);
    expect(budget.potPlans[2].adjustmentAmount).toEqual(-180);
    expect(budget.potPlans[3].adjustmentAmount).toEqual(-405);

    expect(budget.surplus).toEqual(1430);
  });
});
