import { date } from '../utils/date';
import { specificDateOfAnyYear } from './specific-date-of-any-year';

describe('specific date of any year', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date(1, 6, 2022));
  });

  it("works correctly given a date that isn't actually within the correct range", () => {
    const result = specificDateOfAnyYear(
      `31st of May`,
      date(1, 6, 2022),
      date(1, 7, 2022)
    );

    expect(result?.type).toEqual('SpecificDateOfYear');
    expect(result?.dates).toHaveLength(0);
  });

  it('works correctly for first of june for the first week of june', () => {
    const result = specificDateOfAnyYear(
      `1st of June`,
      date(1, 6, 2022),
      date(8, 7, 2022)
    );

    expect(result && result.dates).toHaveLength(1);
    expect(result && result.dates[0]).toBeSameDayAs(date(1, 6, 2022));
  });
});
