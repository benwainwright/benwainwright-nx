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

  it('always sets the first day to today and the last day to a month from now', () => {
    const result = parseDates('1st of June');
    expect(result.dates).toHaveLength(1);

    const result2 = parseDates('2nd of June');
    expect(result2.dates).toHaveLength(1);

    const result3 = parseDates('2nd of June');
    expect(result3.dates).toHaveLength(1);

    const result4 = parseDates('30th of June');
    expect(result4.dates).toHaveLength(1);

    const result5 = parseDates('1st of July');
    expect(result5.dates).toHaveLength(0);

    const result6 = parseDates('31st of May');
    expect(result6.dates).toHaveLength(0);
  });

  const d = (day?: number, month?: number, year?: number) => {
    return day && month && year
      ? {
          date: date(day, month, year),
          text: `${day}/${month}/${year}`,
        }
      : {
          date: undefined,
          text: `.`,
        };
  };

  it.each`
    parseString                        | from              | to                | numResults | date1             | date2             | date3             | date4             | date5             | type
    ${`last thursday of every month`}  | ${d(11, 6, 2022)} | ${d(18, 6, 2022)} | ${0}       | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'NumberedWeekdayOfMonth'}
    ${`last thursday of every month`}  | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(30, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'NumberedWeekdayOfMonth'}
    ${`third thursday of every month`} | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'NumberedWeekdayOfMonth'}
    ${`every third thursday`}          | ${d(1, 6, 2022)}  | ${d(15, 7, 2022)} | ${2}       | ${d(16, 6, 2022)} | ${d(7, 7, 2022)}  | ${d()}            | ${d()}            | ${d()}            | ${'EveryWeek'}
    ${`every other thursday`}          | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${3}       | ${d(2, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(30, 6, 2022)} | ${d()}            | ${d()}            | ${'EveryWeek'}
    ${`every other week on thurs`}     | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${3}       | ${d(2, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(30, 6, 2022)} | ${d()}            | ${d()}            | ${'EveryWeek'}
    ${`every week on thursday`}        | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`every Week on thursday`}        | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`each week on thursday`}         | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`every thursday`}                | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`every Thursday`}                | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`every thurs`}                   | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`each thursday`}                 | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`each thurs`}                    | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`on thursdays`}                  | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${5}       | ${d(2, 6, 2022)}  | ${d(9, 6, 2022)}  | ${d(16, 6, 2022)} | ${d(23, 6, 2022)} | ${d(30, 6, 2022)} | ${'EveryWeek'}
    ${`on the 16th of august`}         | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`28th of jan `}                  | ${d(1, 6, 2022)}  | ${d(10, 3, 2023)} | ${1}       | ${d(28, 1, 2023)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`twenty-eighth of jan`}          | ${d(1, 6, 2022)}  | ${d(10, 3, 2023)} | ${1}       | ${d(28, 1, 2023)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`on the third of june`}          | ${d(31, 5, 2022)} | ${d(30, 6, 2022)} | ${1}       | ${d(3, 6, 2022)}  | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`on the 3rd of june`}            | ${d(31, 5, 2022)} | ${d(30, 6, 2022)} | ${1}       | ${d(3, 6, 2022)}  | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16th of august`}                | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`sixteenth of august`}           | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`sixteenth august`}              | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`the 16th of August`}            | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16/8`}                          | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16/8/22`}                       | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16/8/2022`}                     | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${1}       | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`sixteenth`}                     | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${3}       | ${d(16, 6, 2022)} | ${d(16, 7, 2022)} | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${'SpecificDateOfMonth'}
    ${`on the sixteenth`}              | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${3}       | ${d(16, 6, 2022)} | ${d(16, 7, 2022)} | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${'SpecificDateOfMonth'}
    ${`on the 16th`}                   | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${3}       | ${d(16, 6, 2022)} | ${d(16, 7, 2022)} | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${'SpecificDateOfMonth'}
    ${`16th`}                          | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${3}       | ${d(16, 6, 2022)} | ${d(16, 7, 2022)} | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${'SpecificDateOfMonth'}
    ${`the 16th`}                      | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${3}       | ${d(16, 6, 2022)} | ${d(16, 7, 2022)} | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${'SpecificDateOfMonth'}
    ${`16th of every month`}           | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${3}       | ${d(16, 6, 2022)} | ${d(16, 7, 2022)} | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${'SpecificDateOfMonth'}
    ${`every month on the 16th`}       | ${d(1, 6, 2022)}  | ${d(25, 8, 2022)} | ${3}       | ${d(16, 6, 2022)} | ${d(16, 7, 2022)} | ${d(16, 8, 2022)} | ${d()}            | ${d()}            | ${'SpecificDateOfMonth'}
    ${`16th of june`}                  | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`sixteenth of june`}             | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`sixteenth june`}                | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`the 16th of June`}              | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16/6`}                          | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16/06`}                         | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16/06/2022`}                    | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
    ${`16/06/22`}                      | ${d(1, 6, 2022)}  | ${d(1, 7, 2022)}  | ${1}       | ${d(16, 6, 2022)} | ${d()}            | ${d()}            | ${d()}            | ${d()}            | ${'SpecificDateOfYear'}
  `(
    "'$parseString' produces $numResults date(s) of type '$type' for range '$from.text' to '$to.text' - ('$date1.text', '$date2.text', '$date3.text', '$date4.text', '$date5.text')",
    ({
      parseString,
      from,
      to,
      numResults,
      date1,
      date2,
      date3,
      date4,
      date5,
      type,
    }) => {
      const result = parseDates(parseString, {
        from: from.date,
        to: to.date,
      });

      expect(result.type).toEqual(type);
      expect(result.dates).toHaveLength(numResults);
      if (date1.date) {
        expect(result.dates[0]).toBeSameDayAs(date1.date);
      }

      if (date2.date) {
        expect(result.dates[1]).toBeSameDayAs(date2.date);
      }

      if (date3.date) {
        expect(result.dates[2]).toBeSameDayAs(date3.date);
      }

      if (date4.date) {
        expect(result.dates[3]).toBeSameDayAs(date4.date);
      }

      if (date5.date) {
        expect(result.dates[4]).toBeSameDayAs(date5.date);
      }

      expect.assertions(numResults + 2);
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
