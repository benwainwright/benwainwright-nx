import { getOrdinalIndex } from '../utils/get-ordinal-index';
import { monthsPiped } from '../ordinals/months';
import { daysPiped, wordNumbers } from '../ordinals/number-words';
import { parseMonth } from '../utils/parse-month';
import { getDaysInBetween } from '../utils/get-days-in-between';
import { ParseResult } from '../types/parse-result';

export interface SpecificDateResult extends ParseResult<'SpecificDateOfYear'> {
  day: number;
  month?: number;
  year?: number;
}

const REGEXES = {
  thOfMonth: `(?<day>\\d{1,2})(th|st|nd|rd)(?:(\\sof)?\\s+(?<month>(?:${monthsPiped})))(?:\\s+(?<year>\\d{4}))?`,
  wordOfMonth: `(?<day>${daysPiped})(?:(\\sof)?\\s+(?<month>(?:${monthsPiped})))(?:\\s+(?<year>\\d{4}))?`,
  daySlashMonth: `(?<day>\\d{1,2})\\/(?<month>\\d{1,2})`,
};

const getStart = (
  from: Date,
  month: number,
  day: number,
  year: number
): Date => {
  const start = new Date(from.valueOf());
  start.setMonth(month);
  start.setDate(day);
  start.setFullYear(year);

  if (start < from) {
    return getStart(start, month, day + 1, year);
  }
  return start;
};

export const getDays = (
  from: Date,
  to: Date,
  day: number,
  month: number,
  year: number | undefined
): Date[] => {
  const start = getStart(from, month, day, year ?? from.getFullYear());

  if (start > to) {
    return [];
  }

  return [
    start,
    ...getDays(start, to, day, month, (year ?? from.getFullYear()) + 1),
  ];
};

export const specificDateOfAnyYear = (
  text: string,
  from: Date,
  to?: Date
): SpecificDateResult | undefined => {
  const result =
    new RegExp(REGEXES.thOfMonth, 'gi').exec(text) ??
    new RegExp(REGEXES.wordOfMonth, 'gi').exec(text) ??
    new RegExp(REGEXES.daySlashMonth, 'gi').exec(text);

  if (!result) {
    return undefined;
  }

  // Groups will never be undefined - the regex cannot possibly match without groups
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const day = result.groups!['day'];

  // Groups will never be undefined - the regex cannot possibly match without groups
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const month = result.groups!['month'];

  const year = result.groups?.['year'];

  const parsedDay = getOrdinalIndex(day, wordNumbers, Number(day));

  const parsedMonth = parseMonth(month, from) ?? 1;

  const parsedYear = year ? Number(year) : undefined;

  const realYear =
    to ?? new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  const dates = getDays(from, realYear, parsedDay, parsedMonth, parsedYear);

  return {
    type: 'SpecificDateOfYear',
    dates,
    day: parsedDay,
    month: parsedMonth,
  };
};
