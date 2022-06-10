export const date = (day: number, month: number, year: number): Date => {
  const newDate = new Date();

  newDate.setFullYear(year);
  newDate.setMonth(month - 1);
  newDate.setDate(day);

  return newDate;
};
