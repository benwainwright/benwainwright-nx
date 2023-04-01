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

  const parsedMonth = parseMonth(month, from);

  const parsedYear = year ? Number(year) : undefined;

  const realYear =
    to ?? new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  const dates = getDaysInBetween(from, realYear).filter((date) => {
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
