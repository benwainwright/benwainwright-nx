import { everyWeek } from './strategies/every-week';
import { numberedWeekday } from './strategies/nth-weekday';

import { specificDateOfAnyYear } from './strategies/specific-date-of-any-year';
import { specificDateOfAnyMonth } from './strategies/specific-date-of-any-month';
import { GetDatesResult } from './types/get-dates-result';
import { now } from '@benwainwright/utils';

interface GetDatesOptions {
  from?: Date;
  to: Date;
  max?: number;
}

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
