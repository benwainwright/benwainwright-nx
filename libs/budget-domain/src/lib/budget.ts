import { parseDates } from '@benwainwright/nl-dates';
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

  constructor(
    public readonly id: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    pots: Pot[],
    public readonly balance: number,
    public readonly previous?: Budget
  ) {
    this.potValues = pots.map((pot) => ({
      ...pot,
      adjustmentAmount: 0,
      payments: [],
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

  public setPayments(payments: RecurringPayment[]) {
    this.potValues = this.distributePayments(
      this.potValues,
      payments,
      this.isCurrent()
    );
  }

  private distributePayments(
    pots: Pot[],
    payments: RecurringPayment[],
    currentBudget: boolean
  ): Omit<PotPlan, 'adjustmentAmount'>[] {
    return pots.map((pot) => ({
      id: pot.id,
      balance: currentBudget ? pot.balance : 0,
      name: pot.name,
      payments: payments
        .filter((payment) => payment.potId === pot.id)
        .flatMap((payment) =>
          parseDates(payment.when, {
            from: this.startDate,
            to: this.endDate,
          }).dates.map((date, index) => ({
            id: `${payment.id}-${index}`,
            name: payment.name,
            when: date,
            amount: payment.amount,
          }))
        ),
    }));
  }

  public get potPlans(): PotPlan[] {
    return this.hydratePotplanAdjustments(this.potValues);
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

  public get surplus(): number {
    const balance =
      this.isCurrent() || !this.previous
        ? this.balance
        : this.previous.surplus + this.balance;

    return this.potPlans.reduce(
      (runningBalance, plan) => runningBalance - plan.adjustmentAmount,
      balance
    );
  }
}
