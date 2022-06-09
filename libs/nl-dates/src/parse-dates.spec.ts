import { parseDates } from './parse-dates';
import { date } from './utils/date';

describe('parse dates', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date(1, 6, 2022));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(['every other thursday', 'every other week on thurs'])(
    "can handle alternating weeks from '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(1, 7, 2022),
      });

      expect(result.type).toEqual('EveryWeek');
      expect(result.dates).toHaveLength(3);
      expect(result.dates[0]).toBeSameDayAs(date(2, 6, 2022));
      expect(result.dates[1]).toBeSameDayAs(date(16, 6, 2022));
      expect(result.dates[2]).toBeSameDayAs(date(30, 6, 2022));
    }
  );

  it.each(['third thursday of every month'])(
    "can handle weekdays of months from '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(1, 7, 2022),
      });

      expect(result.type).toEqual('NumberedWeekdayOfMonth');
      expect(result.dates).toHaveLength(1);
      expect(result.dates[0]).toBeSameDayAs(date(16, 6, 2022));
    }
  );

  it.each(['last thursday of every month'])(
    "can handle weekdays of months from '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(1, 7, 2022),
      });

      expect(result.type).toEqual('NumberedWeekdayOfMonth');
      expect(result.dates).toHaveLength(1);
      expect(result.dates[0]).toBeSameDayAs(date(30, 6, 2022));
    }
  );

  it.each(['every third thursday'])(
    "can handle alternating weeks from '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(15, 7, 2022),
      });

      expect(result.type).toEqual('EveryWeek');
      expect(result.dates).toHaveLength(2);
      expect(result.dates[0]).toBeSameDayAs(date(16, 6, 2022));
      expect(result.dates[1]).toBeSameDayAs(date(7, 7, 2022));
    }
  );

  it.each([
    ['every week on thursday'],
    ['every Week on thursday'],
    ['each week on thursday'],
    ['every thursday'],
    ['every Thursday'],
    ['every thurs'],
    ['each thursday'],
    ['each thurs'],
    ['every thur'],
    ['on thursdays'],
  ])("correctly identifies repitition from '%s'", (string) => {
    const result = parseDates(string, {
      from: date(1, 6, 2022),
      to: date(1, 7, 2022),
    });

    expect(result.type).toEqual('EveryWeek');
    expect(result.dates).toHaveLength(5);
    expect(result.dates[0]).toBeSameDayAs(date(2, 6, 2022));
    expect(result.dates[1]).toBeSameDayAs(date(9, 6, 2022));
    expect(result.dates[2]).toBeSameDayAs(date(16, 6, 2022));
    expect(result.dates[3]).toBeSameDayAs(date(23, 6, 2022));
    expect(result.dates[4]).toBeSameDayAs(date(30, 6, 2022));
  });

  it.each([['on the third of june'], ['on the 3rd of june']])(
    "identifies the correct date for '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(31, 5, 2022),
        to: date(30, 6, 2022),
      });

      expect(result.type).toEqual('SpecificDateOfYear');
      expect(result.dates).toHaveLength(1);
      expect(result.dates[0]).toBeSameDayAs(date(3, 6, 2022));
    }
  );

  it.each([['28th of jan'], ['twenty-eighth of jan']])(
    "identifies the correct date for '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(10, 3, 2023),
      });

      expect(result.type).toEqual('SpecificDateOfYear');
      expect(result.dates).toHaveLength(1);
      expect(result.dates[0]).toBeSameDayAs(date(28, 1, 2023));
    }
  );

  it.each([
    ['on the 16th of august'],
    ['16th of august'],
    ['sixteenth of august'],
    ['sixteenth august'],
    ['the 16th of August'],
    ['16/8'],
    ['16/8'],
    ['16/08/2022'],
    ['16/08/22'],
  ])(
    "identifies specific dates that are not in the same month as the start date from '%s",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(25, 8, 2022),
      });

      expect(result.type).toEqual('SpecificDateOfYear');
      expect(result.dates).toHaveLength(1);
      expect(result.dates[0]).toBeSameDayAs(date(16, 8, 2022));
    }
  );

  it('alternate days should be based on ISO 8601 week of year', () => {
    const result = parseDates('every other thursday', {
      from: date(1, 6, 2022),
      to: date(1, 7, 2022),
    });

    expect(result.type).toEqual('EveryWeek');
    expect(result.dates).toHaveLength(3);
    expect(result.dates[0]).toBeSameDayAs(date(2, 6, 2022));
    expect(result.dates[1]).toBeSameDayAs(date(16, 6, 2022));
    expect(result.dates[2]).toBeSameDayAs(date(30, 6, 2022));

    const nextResult = parseDates('every other thursday', {
      from: date(8, 6, 2022),
      to: date(1, 7, 2022),
    });

    expect(nextResult.type).toEqual('EveryWeek');
    expect(nextResult.dates).toHaveLength(2);
    expect(nextResult.dates[0]).toBeSameDayAs(date(16, 6, 2022));
    expect(nextResult.dates[1]).toBeSameDayAs(date(30, 6, 2022));
  });

  it.each([
    ['sixteenth'],
    ['on the sixteenth'],
    ['on the 16th'],
    ['16th'],
    ['the 16th'],
    ['16th of every month'],
    ['every month on the 16th'],
  ])(
    "picks out multiple dates if there is no month specified and the range contains more than one of that date from '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(25, 8, 2022),
      });

      result.dates[0];

      expect(result.type).toEqual('SpecificDateOfMonth');
      expect(result.dates).toHaveLength(3);
      expect(result.dates[0]).toBeSameDayAs(date(16, 6, 2022));
      expect(result.dates[1]).toBeSameDayAs(date(16, 7, 2022));
      expect(result.dates[2]).toBeSameDayAs(date(16, 8, 2022));
    }
  );

  it.each([
    ['16th of june'],
    ['sixteenth of june'],
    ['sixteenth june'],
    ['the 16th of June'],
    ['16/6'],
    ['16/06'],
    ['16/06/2022'],
    ['16/06/22'],
  ])("correctly identifies specific dates from '%s'", (string) => {
    const result = parseDates(string, {
      from: date(1, 6, 2022),
      to: date(1, 7, 2022),
    });

    expect(result.type).toEqual('SpecificDateOfYear');
    expect(result.dates).toHaveLength(1);
    expect(result.dates[0]).toBeSameDayAs(date(16, 6, 2022));
  });

  it.each(['foo', '', 'asfdasd', 'alex'])(
    "should return an empty arry for strings it doesn't understand '%s'",
    (string) => {
      const result = parseDates(string, {
        from: date(1, 6, 2022),
        to: date(25, 8, 2022),
      });

      expect(result.type).toEqual('None');
      expect(result.dates).toHaveLength(0);
    }
  );
});
