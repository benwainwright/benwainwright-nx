import { z } from 'zod';

const potPlan = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  otherField: z.string(),
  payments: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      when: z.date(),
      end: z.date(),
      amount: z.number(),
    })
  ),
});

export const budgetSchema = z.object({
  username: z.string(),
  id: z.string(),
  endDate: z.date(),
  startDate: z.date(),
  rawBalance: z.number(),
  potValues: z.array(potPlan),
});

export type StoredBudget = z.infer<typeof budgetSchema>;

export type IBudget = Omit<StoredBudget, 'username'>;
