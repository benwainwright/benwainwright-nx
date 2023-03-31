export const STATUS_CODES = {
  BadRequest: 400,
  Forbidden: 403,
  Ok: 200,
  InternalServerError: 500,
} as const;

export type Codes = typeof STATUS_CODES[keyof typeof STATUS_CODES];
