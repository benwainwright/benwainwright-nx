import { date } from './date';
import { getLastOfMonth } from './get-last-of-month';

describe('get last of month', () => {
  it('correctly gets the last day of the month for date 25/11/2022', () => {
    const result = getLastOfMonth(date(25, 11, 2022));
    expect(result).toBeSameDayAs(date(30, 11, 2022));
  });

  it('handles the year change at the end of december', () => {
    const result = getLastOfMonth(date(25, 12, 2022));
    expect(result).toBeSameDayAs(date(31, 12, 2022));
  });
});
