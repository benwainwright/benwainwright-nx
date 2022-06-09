import { parseDates } from './parse-dates';

const ONE_WEEK = 7;

export const getNextValidDate = (from: Date, text: string): Date => {
  const to = new Date(from.valueOf());
  to.setDate(to.getDate() + ONE_WEEK);

  const result = parseDates(text, { from, to });

  if (result.type === 'None') {
    throw new Error('Could not parse input string');
  }

  if (result.dates.length > 0) {
    return result.dates[0];
  }

  return getNextValidDate(to, text);
};
