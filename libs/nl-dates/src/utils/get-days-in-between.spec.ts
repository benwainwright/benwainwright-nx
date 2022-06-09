import { date } from './date';
import { getDaysInBetween } from './get-days-in-between';

describe('get days in between', () => {
  it('returns an array of date objects in between two dates inclusive of start date and exclusive of end date', () => {
    const days = getDaysInBetween(date(1, 6, 2022), date(6, 6, 2022));

    expect(days).toHaveLength(5);
    expect(days[0]).toBeSameDayAs(date(1, 6, 2022));
    expect(days[1]).toBeSameDayAs(date(2, 6, 2022));
    expect(days[2]).toBeSameDayAs(date(3, 6, 2022));
    expect(days[3]).toBeSameDayAs(date(4, 6, 2022));
    expect(days[4]).toBeSameDayAs(date(5, 6, 2022));
  });

  it('correctly crosses month boundaries', () => {
    const days = getDaysInBetween(date(31, 5, 2022), date(30, 6, 2022));

    expect(days).toHaveLength(30);
    expect(days[0]).toBeSameDayAs(date(31, 5, 2022));
    expect(days[1]).toBeSameDayAs(date(1, 6, 2022));
  });
});
