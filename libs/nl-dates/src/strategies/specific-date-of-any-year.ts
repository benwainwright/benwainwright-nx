import { getOrdinalIndex } from '../utils/get-ordinal-index';
import { monthsPiped } from '../ordinals/months';
import { daysPiped, wordNumbers } from '../ordinals/number-words';
import { parseMonth } from '../utils/parse-month';
import { ParseResult } from '../types/parse-result';
import { DateTime, Interval } from 'luxon';

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

const getDates = (
  range: Interval,
  day: number,
  month: number,
  year: number | undefined
) => {
  if (year) {
    const theDate = DateTime.fromObject({
      day,
      month,
      year,
      hour: 0,
      minute: 0,
      second: 0,
    });

    if (range.contains(theDate)) {
      return [theDate];
    }
  } else {
    const theDate = DateTime.fromObject({
      day,
      month,
      year: range.start?.year,
      hour: 0,
      minute: 0,
      second: 0,
    });

    if (range.contains(theDate)) {
      return [theDate];
    }
    if (range.start) {
      const theNextDate = DateTime.fromObject({
        day,
        month,
        year: range.start.year + 1,
        hour: 0,
        minute: 0,
        second: 0,
      });

      if (range.contains(theNextDate)) {
        return [theNextDate];
      }
    }
  }
  return [];
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

  const parsedMonth = (parseMonth(month, from) ?? 0) + 1;

  const parsedYear = year ? Number(year) : undefined;

  const realYear =
    to ?? new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  const range = Interval.fromDateTimes(from, realYear);

  const dates = getDates(range, parsedDay, parsedMonth, parsedYear);

  return {
    type: 'SpecificDateOfYear',
    dates: dates.map((date) => date.toJSDate()),
    day: parsedDay,
    month: parsedMonth,
  };
};
