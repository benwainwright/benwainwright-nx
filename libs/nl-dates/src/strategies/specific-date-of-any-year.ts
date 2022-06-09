import { ParseResult } from '../types/get-dates-type';
import { getOrdinalIndex } from '../utils/get-ordinal-index';
import { monthsPiped } from '../ordinals/months';
import { daysPiped, wordNumbers } from '../ordinals/number-words';
import { parseMonth } from '../utils/parse-month';
import { getDaysInBetween } from '../utils/get-days-in-between';

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

export const specificDateOfAnyYear = (
  text: string,
  from: Date,
  to: Date
): SpecificDateResult | undefined => {
  const result =
    new RegExp(REGEXES.thOfMonth, 'gi').exec(text) ??
    new RegExp(REGEXES.wordOfMonth, 'gi').exec(text) ??
    new RegExp(REGEXES.daySlashMonth, 'gi').exec(text);

  if (!result) {
    return undefined;
  }

  const day = result.groups?.['day'];
  const month = result.groups?.['month'];
  const year = result.groups?.['year'];

  const parsedDay = day && getOrdinalIndex(day, wordNumbers, Number(day));

  if (parsedDay === undefined || parsedDay === '') {
    return undefined;
  }

  if (['every', 'each'].includes(month?.toLowerCase() ?? '')) {
    return undefined;
  }

  const parsedMonth = parseMonth(month, from);

  const parsedYear = year ? Number(year) : undefined;

  const dates = getDaysInBetween(from, to).filter((date) => {
    return (
      date.getDate() === parsedDay &&
      (parsedMonth === undefined || date.getMonth() === parsedMonth) &&
      (parsedYear === undefined || date.getFullYear() === parsedYear)
    );
  });

  return {
    type: 'SpecificDateOfYear',
    dates,
    day: parsedDay,
    month: parsedMonth,
  };
};
