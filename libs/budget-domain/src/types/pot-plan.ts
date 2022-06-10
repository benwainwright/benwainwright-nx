import { ConcretePayment } from './concrete-payment';
import { Pot } from './pot';

export type PotPlan = Pot & {
  payments: ConcretePayment[];
  adjustmentAmount: number;
};
