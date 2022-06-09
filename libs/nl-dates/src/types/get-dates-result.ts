import { EveryWeekResult } from '../strategies/every-week';
import { NumberedWeekdayResult } from '../strategies/nth-weekday';
import { EveryMonthResult } from '../strategies/specific-date-of-any-month';
import { SpecificDateResult } from '../strategies/specific-date-of-any-year';
import { NoParseResult } from './no-parse-result';

export type GetDatesResult =
  | EveryMonthResult
  | SpecificDateResult
  | NumberedWeekdayResult
  | EveryWeekResult
  | NoParseResult;
