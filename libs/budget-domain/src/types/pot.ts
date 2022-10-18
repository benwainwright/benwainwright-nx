import { z } from 'zod';

export const potSchema = z.object({
  id: z.string(),
  username: z.string(),
  balance: z.number(),
  name: z.string(),
});

export type StoredPot = z.infer<typeof potSchema>;

export type Pot = Omit<StoredPot, 'username'>;
