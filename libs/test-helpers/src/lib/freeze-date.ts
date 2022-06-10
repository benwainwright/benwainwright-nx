import { date } from '@benwainwright/utils';

export const freezeDateWithJestFakeTimers = (
  day: number,
  month: number,
  year: number
) => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date(day, month, year));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
};
