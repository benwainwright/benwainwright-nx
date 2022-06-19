import { getOrdinalIndex } from '../utils/get-ordinal-index';
import { nthWeekdayOptionsPiped, wordNumbers } from '../ordinals/number-words';
import { parseMonth } from '../utils/parse-month';
import { weekdaysPiped, weekDays } from '../ordinals/weekdays';
import { getDaysInBetween } from '../utils/get-days-in-between';
import { monthsPiped } from '../ordinals/months';
import { ParseResult } from '../types/parse-result';
import { groupOrderedDatesByMonth } from '../utils/group-ordered-dates-by-month';
import { getLastOfMonth } from '../utils/get-last-of-month';
import { isSameDate, now } from '@benwainwright/utils';

export interface NumberedWeekdayResult
  extends ParseResult<'NumberedWeekdayOfMonth'> {
  weekDay: number;
  dates: Date[];
  which: number | 'last';
}

const last = (
  month: string | undefined,
  day: string,
  from: Date,
  to: Date
): NumberedWeekdayResult | undefined => {
  const weekDay = getOrdinalIndex(day, weekDays, now().getDay());

  const allDays = getDaysInBetween(from, to);

  const daysGroupedByMonth = groupOrderedDatesByMonth(allDays);

  const lastOfFullMonths = daysGroupedByMonth
    .map((group) => group[0])
    .map((start) => {
      const last = getLastOfMonth(start);
      const next = new Date(last.valueOf());
      next.setDate(last.getDate() + 1);
      return getDaysInBetween(start, next).filter(
        (date) => date.getDay() === weekDay
      );
    })
    .map((month) => month.slice().reverse())
    .map((month) => month[0])
    .filter(Boolean);

  const finalDates = lastOfFullMonths.filter(
    (last) => allDays.findIndex((date) => isSameDate(last, date)) !== -1
  );

  return {
    type: 'NumberedWeekdayOfMonth',
    weekDay: weekDay,
    dates: finalDates,
    which: 'last',
  };
};

const forwards = (
  month: string | undefined,
  which: string,
  day: string,
  from: Date,
  to: Date
): NumberedWeekdayResult | undefined => {
  const parsedMonth = parseMonth(month, from);
  const parsedWhich = getOrdinalIndex(which ?? '', wordNumbers, -1);

  if (parsedWhich === -1) {
    return undefined;
  }

  const weekDay = getOrdinalIndex(day ?? '', weekDays, now().getDay());

  const allWeekdays = getDaysInBetween(from, to).filter(
    (date) => date.getDay() === weekDay
  );

  const daysGroupedByMonth = groupOrderedDatesByMonth(allWeekdays);

  const finalDays = daysGroupedByMonth
    .map((group) => group.filter((date, index) => index + 1 === parsedWhich))
    .flat()
    .filter(
      (date) => parseMonth === undefined || date.getMonth() === parsedMonth
    );

  return {
    type: 'NumberedWeekdayOfMonth',
    weekDay: weekDay,
    dates: finalDays,
    which: parsedWhich,
  };
};

const REGEXES = {
  nthWeekDay: `(?<which>${nthWeekdayOptionsPiped})\\s+(?<weekDay>${weekdaysPiped})(?:of\\s+(each|every)\\s+month)?$`,
  nthWeekDayWithMonth: `(?<which>${nthWeekdayOptionsPiped})\\s+(?<weekDay>${weekdaysPiped})(?:of\\s+(?:(each|every)\\s+)?(?<month>${monthsPiped}))?`,
};

export const numberedWeekday = (
  text: string,
  from: Date,
  to: Date
): NumberedWeekdayResult | undefined => {
  const numberedWeekdayResult =
    new RegExp(REGEXES.nthWeekDay, 'gi').exec(text) ??
    new RegExp(REGEXES.nthWeekDayWithMonth, 'gi').exec(text);

  if (!numberedWeekdayResult) {
    return undefined;
  }

  // Groups will never be undefined - the regex cannot possibly match without groups
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const which = numberedWeekdayResult.groups!['which'];

  // Groups will never be undefined - the regex cannot possibly match without groups
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const day = numberedWeekdayResult.groups!['weekDay'];

  const month = numberedWeekdayResult.groups?.['weekDay'];

  return which === 'last'
    ? last(month, day, from, to)
    : forwards(month, which, day, from, to);
};
