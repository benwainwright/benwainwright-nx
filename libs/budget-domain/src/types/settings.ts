import { z } from 'zod';

export const settingsSchema = z.object({
  id: z.string(),
  username: z.string(),
  payCycle: z.string(),
  salary: z.number(),
  overdraft: z.number(),
});

export type Settings = z.infer<typeof settingsSchema>;
