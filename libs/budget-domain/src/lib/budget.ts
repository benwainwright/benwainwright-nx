import { parseDates, ParseDatesMode } from '@benwainwright/nl-dates';
import { ConcretePayment } from '../types/concrete-payment';
import { Pot } from '../types/pot';
import { PotPlan } from '../types/pot-plan';
import { RecurringPayment } from '../types/recurring-payment';

export interface PaymentPlan {
  startDate: Date;
  endDate: Date;
  potPlans: PotPlan[];
}

export class Budget {
  private potValues: Omit<PotPlan, 'adjustmentAmount'>[];
  private payments: RecurringPayment[] = [];
  public paidIds: { [id: string]: boolean } = {};
  private editedConcretePayments: { [id: string]: ConcretePayment } = {};

  public static fromJson(data: Budget) {
    const budget = new Budget(
      data.id,
      new Date(data.startDate),
      new Date(data.endDate),
      [],
      0
    );
    budget.paidIds = data.paidIds;
    budget.editedConcretePayments = data.editedConcretePayments ?? {};
    budget.balance = data.balance;

    budget.potValues = data.potValues.map((pot) => ({
      ...pot,
      payments: pot.payments.map((payment) => ({
        ...payment,
        when: new Date(payment.when),
      })),
    }));
    return budget;
  }

  private rawBalance: number;

  constructor(
    public readonly id: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    pots: Pot[],
    balance: number,
    public previous?: Budget
  ) {
    this.rawBalance = balance;
    this.potValues = pots.map((pot) => ({
      ...pot,
      adjustmentAmount: 0,
      totalPaid: 0,
      payments: [],
    }));
  }

  private hydratePotplanAdjustments(
    potPlans: Omit<PotPlan, 'adjustmentAmount' | 'totalPaid'>[]
  ): PotPlan[] {
    return potPlans.map((plan) => {
      const totalPaid = plan.payments.reduce(
        (runningTotal, payment) =>
          (payment.paid ? payment.amount : 0) + runningTotal,
        0
      );

      const adjustmentAmount =
        plan.payments.reduce((runningTotal, payment) => {
          return runningTotal + payment.amount;
        }, 0) -
        plan.balance -
        totalPaid;

      return {
        totalPaid,
        adjustmentAmount: parseFloat(adjustmentAmount.toFixed(2)),
        ...plan,
      };
    });
  }

  public pastPresentOrFuture(): 'Past' | 'Current' | 'Future' {
    const now = new Date(Date.now());
    const start = new Date(this.startDate.valueOf());

    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);

    const end = new Date(this.endDate.valueOf());

    end.setHours(0);
    end.setMinutes(0);
    end.setSeconds(0);
    end.setMilliseconds(0);

    if (now > start && now < end) {
      return 'Current';
    }

    if (now < start) {
      return 'Future';
    }

    return 'Past';
  }

  public isCurrent(): boolean {
    const now = new Date(Date.now());
    const start = new Date(this.startDate.valueOf());

    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);

    const end = new Date(this.endDate.valueOf());

    end.setHours(0);
    end.setMinutes(0);
    end.setSeconds(0);
    end.setMilliseconds(0);

    return now > start && now < end;
  }

  public get totalAllocated(): number {
    return this.potPlans.reduce(
      (accum, pot) =>
        pot.balance + pot.adjustmentAmount + accum + pot.totalPaid,
      0
    );
  }

  public get potTotals(): number {
    return this.potPlans.reduce((accum, pot) => pot.balance + accum, 0);
  }

  public setPayments(payments: RecurringPayment[]) {
    this.payments = payments;
  }

  public editConcretePayment(payment: ConcretePayment) {
    this.editedConcretePayments[payment.id] = { ...payment, edited: true };
  }

  public resetConcretePayment(id: string) {
    delete this.editedConcretePayments[id];
  }

  public togglePaymentPaidStatus(payment: ConcretePayment) {
    this.paidIds[payment.id] = !this.paidIds[payment.id];
  }

  private parseDatesFromPayment(payment: RecurringPayment) {
    const end = payment.end
      ? parseDates(payment.end, {
          mode: ParseDatesMode.SingleDateOnly,
        })
      : undefined;

    if (end && end.dates.length > 0 && end.dates[0] < this.endDate) {
      return [];
    }

    const to =
      end && end.dates.length > 0 && end.dates[0] < this.endDate
        ? end.dates[0]
        : this.endDate;

    return parseDates(payment.when, {
      from: this.startDate,
      to,
      mode: ParseDatesMode.Normal,
    }).dates.map((date, index) => {
      const id = `${payment.id}-${index}`;
      const edited = this.editedConcretePayments[id];
      return edited
        ? edited
        : {
            id,
            paid: this.paidIds[id],
            edited: false,
            name: payment.name,
            when: date,
            originalPayment: payment,
            amount: payment.amount,
          };
    });
  }

  private getCacheString(
    pots: Pot[],
    payments: RecurringPayment[],
    isCurrent: boolean
  ) {
    const potsString = pots.reduce(
      (accum, pot) => `${accum}${pot.id}${pot.balance}`,
      ``
    );

    const paymentsString = payments.reduce(
      (accum, payment) =>
        `${accum}${payment.id}${payment.end}${payment.when}${payment.potId}${payment.amount}`,
      ``
    );

    return `${potsString}${paymentsString}${isCurrent}`;
  }

  private cachedPotPlan: PotPlan[] | undefined;

  private cacheString: string | undefined;

  private distributePayments(
    pots: Pot[],
    payments: RecurringPayment[],
    currentBudget: boolean
  ): Omit<PotPlan, 'adjustmentAmount' | 'totalPaid'>[] {
    return pots.map((pot) => ({
      id: pot.id,
      balance: currentBudget ? pot.balance : 0,
      name: pot.name,
      payments: payments
        .filter((payment) => payment.potId === pot.id)
        .flatMap((payment) => this.parseDatesFromPayment(payment))
        .slice()
        .sort((a, b) => (a.when > b.when ? 1 : -1)),
    }));
  }

  public get potPlans(): PotPlan[] {
    const pots = this.pots;
    const payments = this.payments;

    const cacheString = this.getCacheString(pots, payments, this.isCurrent());

    if (this.cacheString === cacheString && this.cachedPotPlan) {
      return this.cachedPotPlan;
    }

    const values = this.distributePayments(
      this.pots,
      this.payments,
      this.isCurrent()
    );

    const potPlan = this.hydratePotplanAdjustments(values);
    this.cachedPotPlan = potPlan;
    this.cacheString = cacheString;
    return potPlan;
  }

  public get pots(): Pot[] {
    return this.potValues.map((pot) => ({
      id: pot.id,
      balance: pot.balance,
      name: pot.name,
    }));
  }

  public set pots(pots: Pot[]) {
    this.potValues = this.potValues.map((pot) => ({
      ...pot,
      ...pots.find((needle) => pot.id === needle.id),
    }));
  }

  public get balance(): number {
    return this.isCurrent() || !this.previous
      ? this.rawBalance
      : this.previous.surplus + this.rawBalance;
  }

  public set balance(balance: number) {
    this.rawBalance = balance;
  }

  public get totalPaid(): number {
    return this.potPlans.reduce((accum, pot) => pot.totalPaid + accum, 0);
  }

  public get surplus(): number {
    return this.potPlans.reduce(
      (runningBalance, plan) => runningBalance - plan.adjustmentAmount,
      this.balance
    );
  }
}
