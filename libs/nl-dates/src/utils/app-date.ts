export class AppDate {
  private date: Date;

  private constructor(...args: ConstructorParameters<typeof Date>) {
    this.date = new Date(...args);
  }

  public getMonth() {
    return this.date.getMonth();
  }

  public getDay() {
    return this.date.getDay();
  }

  public getDate() {
    return this.date.getDate();
  }

  public getFullYear() {
    return this.date.getFullYear();
  }

  public toDate(): Date {
    return new Date(this.date.valueOf());
  }

  /*
   * Implementation from StackOverflow:
   *   https://stackoverflow.com/a/39502645/3104399
   */
  public getWeekNumber(): number {
    const target = new Date(this.date.valueOf());

    const dayNumber = (target.getDay() + 6) % 7;

    target.setDate(target.getDate() - dayNumber + 3);

    const firstThursday = target.valueOf();

    target.setMonth(0, 1);

    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }

    return (
      1 + Math.ceil((firstThursday.valueOf() - target.valueOf()) / 604800000)
    );
  }

  public static create(date: Date): AppDate;
  public static create(day: number, month: number, year: number): AppDate;
  public static create(
    dateOrDay: number | Date,
    month?: number,
    year?: number
  ): AppDate {
    if (dateOrDay instanceof Date) {
      const number = dateOrDay.valueOf();
      return new AppDate(number);
    }

    const newDate = new AppDate(0);

    // The below cannot possibly be null due to the function overload

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newDate.date.setFullYear(year!);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newDate.date.setMonth(month! - 1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newDate.date.setDate(dateOrDay!);

    newDate.date.setHours(0);

    return newDate;
  }
}
