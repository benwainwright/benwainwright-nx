import { z } from 'zod';

export const paymentSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  when: z.string(),
  potId: z.string(),
  amount: z.number(),
  end: z.string().optional(),
});

export type StoredPot = z.infer<typeof paymentSchema>;

export type RecurringPayment = Omit<StoredPot, 'username'>;
