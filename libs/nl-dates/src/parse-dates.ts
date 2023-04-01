import { everyWeek } from './strategies/every-week';
import { numberedWeekday } from './strategies/nth-weekday';

import { specificDateOfAnyYear } from './strategies/specific-date-of-any-year';
import { specificDateOfAnyMonth } from './strategies/specific-date-of-any-month';
import { GetDatesResult } from './types/get-dates-result';
import { now } from '@benwainwright/utils';

export enum ParseDatesMode {
  Normal = 'Normal',
  SingleDateOnly = 'SingleDateOnly',
}

interface GetDatesOptionsNormal {
  from?: Date;
  to?: Date;
  max?: number;
  mode: ParseDatesMode.Normal;
}

interface GetDatesOptionsSingleDateOnly {
  mode: ParseDatesMode.SingleDateOnly;
}

export type GetDatesOptions =
  | GetDatesOptionsNormal
  | GetDatesOptionsSingleDateOnly;

const dates = (
  options: GetDatesOptions = { mode: ParseDatesMode.Normal }
): [Date, Date | undefined] => {
  if (options?.mode === ParseDatesMode.Normal) {
    const nextMonth = now();
    nextMonth.setMonth(now().getMonth() + 1);
    return [options?.from ?? now(), options?.to ?? nextMonth];
  }
  const start = new Date(0);
  const nextMonth = now();
  nextMonth.setMonth(now().getMonth() + 1);
  return [start, undefined];
};

export const parseDates = (
  text: string,
  options?: GetDatesOptions
): GetDatesResult => {
  const [from, to] = dates(options);

  if (from && to) {
    const everyWeekResult = everyWeek(text, from, to);

    if (everyWeekResult) {
      return everyWeekResult;
    }

    const numberedWeekdayResult = numberedWeekday(text, from, to);

    if (numberedWeekdayResult) {
      return numberedWeekdayResult;
    }
  }

  const specificDateOfAnyYearResult = specificDateOfAnyYear(text, from, to);

  if (specificDateOfAnyYearResult) {
    return specificDateOfAnyYearResult;
  }

  if (from && to) {
    const specificDateOfAnyMonthResult = specificDateOfAnyMonth(text, from, to);

    if (specificDateOfAnyMonthResult) {
      return specificDateOfAnyMonthResult;
    }
  }

  return {
    type: 'None',
    dates: [],
  };
};
