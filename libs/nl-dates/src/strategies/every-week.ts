import { getOrdinalIndex } from '../utils/get-ordinal-index';
import {
  alternatingWordnumbersPiped,
  wordNumbers,
} from '../ordinals/number-words';
import { weekdaysPiped, weekDays } from '../ordinals/weekdays';
import { getDaysInBetween } from '../utils/get-days-in-between';
import { AppDate } from '../utils/app-date';
import { ParseResult } from '../types/parse-result';
import { now } from '@benwainwright/utils';

export interface EveryWeekResult extends ParseResult<'EveryWeek'> {
  weekDay: number;
  dates: Date[];
  alternatingNumber: number;
}

const REGEXES = {
  everyWeek: `(each|every)\\s+(?:(?<alternating>${alternatingWordnumbersPiped})?\\s+)?week(?:\\son\\s+(?<weekDay>(?:${weekdaysPiped})))?`,
  everySpecificWeekday: `(each|every)\\s+(?:(?<alternating>${alternatingWordnumbersPiped})?\\s+)?(?<weekDay>(?:${weekdaysPiped}))\\b`,
  onWeekday: `on\\s+(?<weekDay>(?:${weekdaysPiped})+)s`,
};

export const everyWeek = (
  text: string,
  from: Date,
  to: Date
): EveryWeekResult | undefined => {
  const everyWeekResult =
    new RegExp(REGEXES.everyWeek, 'gi').exec(text) ??
    new RegExp(REGEXES.everySpecificWeekday, 'gi').exec(text) ??
    new RegExp(REGEXES.onWeekday, 'gi').exec(text);

  if (!everyWeekResult) {
    return undefined;
  }

  const day = everyWeekResult.groups?.['weekDay'];

  const alternating = everyWeekResult.groups?.['alternating'];

  const alternatingNumber =
    alternating === 'other'
      ? 2
      : getOrdinalIndex(alternating ?? '', wordNumbers, 1);

  const weekDay = getOrdinalIndex(day ?? '', weekDays, now().getDay());

  const allDates = getDaysInBetween(from, to)
    .filter((date) => date.getDay() === weekDay)
    .filter((item) => {
      const appDate = AppDate.create(item);
      return appDate.getWeekNumber() % alternatingNumber === 0;
    });

  return {
    type: 'EveryWeek',
    weekDay: weekDay,
    dates: allDates,
    alternatingNumber,
  };
};
