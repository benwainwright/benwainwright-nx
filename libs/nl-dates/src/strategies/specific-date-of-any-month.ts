import { daysPiped, wordNumbers } from '../ordinals/number-words';
import { ParseResult } from '../types/parse-result';
import { getDaysInBetween } from '../utils/get-days-in-between';
import { getOrdinalIndex } from '../utils/get-ordinal-index';

export const REGEXES = {
  thOnlyWord: `(?<day>(?:${daysPiped}))`,
  thOnlyNumber: `(?<day>\\d{1,2})(th|st|nd|rd)`,
};

export interface EveryMonthResult extends ParseResult<'SpecificDateOfMonth'> {
  day: number;
}

export const specificDateOfAnyMonth = (
  text: string,
  from: Date,
  to: Date
): EveryMonthResult | undefined => {
  const result =
    new RegExp(REGEXES.thOnlyNumber, 'gi').exec(text) ??
    new RegExp(REGEXES.thOnlyWord, 'gi').exec(text);

  if (!result) {
    return undefined;
  }

  // Groups will never be undefined - the regex cannot possibly match without groups
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const day = result.groups!['day'];

  const parsedDay = getOrdinalIndex(day, wordNumbers, Number(day));

  const dates = getDaysInBetween(from, to).filter((date) => {
    return date.getDate() === parsedDay;
  });

  return {
    type: 'SpecificDateOfMonth',
    dates,
    day: parsedDay,
  };
};
