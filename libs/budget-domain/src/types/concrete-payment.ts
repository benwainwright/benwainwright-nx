import { RecurringPayment } from './recurring-payment';

export interface ConcretePayment {
  id: string;
  name: string;
  edited: boolean;
  originalPayment?: RecurringPayment;
  when: Date;
  amount: number;
  paid: boolean;
}
