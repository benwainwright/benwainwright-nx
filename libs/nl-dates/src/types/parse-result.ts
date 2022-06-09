import { GetDatesType } from './get-dates-type';

export interface ParseResult<T extends GetDatesType> {
  type: T;
  dates: Date[];
}
