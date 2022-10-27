import { ConcretePayment } from './concrete-payment';
import { Pot } from './pot';

export type PotPlan = Omit<Pot, 'username'> & {
  payments: ConcretePayment[];
  adjustmentAmount: number;
  totalPaid: number;
};
