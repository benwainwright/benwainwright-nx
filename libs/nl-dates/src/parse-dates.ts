import { everyWeek, EveryWeekResult } from './strategies/every-week';
import { ParseResult } from './types/get-dates-type';
import { now } from './utils/now';
import {
  numberedWeekday,
  NumberedWeekdayResult,
} from './strategies/nth-weekday';

import {
  specificDateOfAnyYear,
  SpecificDateResult,
} from './strategies/specific-date-of-any-year';
import {
  EveryMonthResult,
  specificDateOfAnyMonth,
} from './strategies/specific-date-of-any-month';

interface GetDatesOptions {
  from?: Date;
  to: Date;
  max?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NoParseResult extends ParseResult<'None'> {}

type GetDatesResult =
  | EveryMonthResult
  | SpecificDateResult
  | NumberedWeekdayResult
  | EveryWeekResult
  | NoParseResult;

const dates = (options?: GetDatesOptions): [Date, Date] => {
  const nextMonth = now();
  nextMonth.setMonth(now().getMonth() + 1);
  return [options?.from ?? now(), options?.to ?? nextMonth];
};

export const parseDates = (
  text: string,
  options?: GetDatesOptions
): GetDatesResult => {
  const [from, to] = dates(options);

  const everyWeekResult = everyWeek(text, from, to);

  if (everyWeekResult) {
    return everyWeekResult;
  }

  const numberedWeekdayResult = numberedWeekday(text, from, to);

  if (numberedWeekdayResult) {
    return numberedWeekdayResult;
  }

  const specificDateOfAnyYearResult = specificDateOfAnyYear(text, from, to);

  if (specificDateOfAnyYearResult) {
    return specificDateOfAnyYearResult;
  }

  const specificDateOfAnyMonthResult = specificDateOfAnyMonth(text, from, to);

  if (specificDateOfAnyMonthResult) {
    return specificDateOfAnyMonthResult;
  }

  return {
    type: 'None',
    dates: [],
  };
};
