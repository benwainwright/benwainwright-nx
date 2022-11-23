import { RecurringPayment } from './recurring-payment';

export interface ConcretePayment {
  id: string;
  name: string;
  originalPayment: RecurringPayment;
  when: Date;
  amount: number;
  paid: boolean;
}
