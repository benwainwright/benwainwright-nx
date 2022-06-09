import { date } from './date';
import { groupOrderedDatesByMonth } from './group-ordered-dates-by-month';

describe('group dates by month', () => {
  it('should return an empty array if passed one', () => {
    const result = groupOrderedDatesByMonth([]);
    expect(result).toHaveLength(0);
  });

  it('should return a single array containing dates from the same month when passed a few dates', () => {
    const result = groupOrderedDatesByMonth([
      date(2, 6, 2022),
      date(5, 6, 2022),
    ]);

    expect(result).toEqual([[date(2, 6, 2022), date(5, 6, 2022)]]);
  });

  it('should split dates in different months up into separate arrays', () => {
    const result = groupOrderedDatesByMonth([
      date(2, 6, 2022),
      date(5, 6, 2022),
    ]);

    expect(result).toEqual([[date(2, 6, 2022), date(5, 6, 2022)]]);
  });

  it('should split dates in different months up into separate arrays', () => {
    const result = groupOrderedDatesByMonth([
      date(2, 6, 2022),
      date(5, 6, 2022),
      date(2, 7, 2022),
      date(4, 7, 2022),
    ]);

    expect(result).toEqual([
      [date(2, 6, 2022), date(5, 6, 2022)],
      [date(2, 7, 2022), date(4, 7, 2022)],
    ]);
  });
});
