import { date } from '@benwainwright/utils';

export function freezeDateWithJestFakeTimers(date: Date): void;

export function freezeDateWithJestFakeTimers(
  day: number,
  month: number,
  year: number
): void;

export function freezeDateWithJestFakeTimers(
  day: number | Date,
  month?: number,
  year?: number
): void {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(
      day instanceof Date ? day : date(day, month ?? 0, year ?? 0)
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });
}
