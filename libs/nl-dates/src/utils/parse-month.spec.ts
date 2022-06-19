import { now } from '@benwainwright/utils';
import { date } from './date';
import { parseMonth } from './parse-month';

describe('parse month', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date(1, 6, 2022));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('gets the correct month index when the word is supplied', () => {
    const month = parseMonth('august', now());
    expect(month).toEqual(7);
  });

  it('returns undefined if no word is supplied', () => {
    const month = parseMonth(undefined, now());
    expect(month).toBeUndefined();
  });

  it('returns the number - 1 if number is supplied', () => {
    const month = parseMonth('2', now());
    expect(month).toEqual(1);
  });

  it('returns the month from the current date if word is not a number but no ordinal is found', () => {
    const month = parseMonth('foo', now());
    expect(month).toEqual(5);
  });
});
