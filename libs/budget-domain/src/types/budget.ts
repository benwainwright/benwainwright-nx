import { z } from 'zod';

const potPlan = z.object({
  payments: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      when: z.date(),
      amount: z.number(),
    })
  ),
});

export const budgetSchema = z.object({
  username: z.string(),
  id: z.date(),
  endDate: z.date(),
  startDate: z.date(),
  rawBalance: z.number(),
  potValues: z.array(potPlan),
});

export type StoredBudget = z.infer<typeof budgetSchema>;

export type Budget = Omit<StoredBudget, 'username'>;
