import { getOrdinalIndex } from '../utils/get-ordinal-index';
import { now } from '../utils/now';
import { nthWeekdayOptionsPiped, wordNumbers } from '../ordinals/number-words';
import { parseMonth } from '../utils/parse-month';
import { weekdaysPiped, weekDays } from '../ordinals/weekdays';
import { getDaysInBetween } from '../utils/get-days-in-between';
import { monthsPiped } from '../ordinals/months';
import { ParseResult } from '../types/parse-result';
import { groupOrderedDatesByMonth } from '../utils/group-ordered-dates-by-month';

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
  const parsedMonth = parseMonth(month, from);

  const weekDay = getOrdinalIndex(day, weekDays, now().getDay());

  const allWeekdays = getDaysInBetween(from, to).filter(
    (date) => date.getDay() === weekDay
  );

  const daysGroupedByMonth = groupOrderedDatesByMonth(allWeekdays);

  const finalDays = daysGroupedByMonth
    .map((group) => group.slice().reverse())
    .map((group) => group[0])
    .filter(
      (date) => parseMonth === undefined || date.getMonth() === parsedMonth
    );

  return {
    type: 'NumberedWeekdayOfMonth',
    weekDay: weekDay,
    dates: finalDays,
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
