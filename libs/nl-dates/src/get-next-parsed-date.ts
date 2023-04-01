import { parseDates, ParseDatesMode } from './parse-dates';

const ONE_WEEK = 7;

export const getNextParsedDate = (from: Date, text: string): Date => {
  const to = new Date(from.valueOf());
  to.setDate(to.getDate() + ONE_WEEK);

  const result = parseDates(text, { from, to, mode: ParseDatesMode.Normal });

  if (result.type === 'None') {
    throw new Error('Could not parse input string');
  }

  if (result.dates.length > 0) {
    return result.dates[0];
  }

  return getNextParsedDate(to, text);
};
