export const getLastOfMonth = (date: Date, originalDate?: Date): Date => {
  if (
    originalDate &&
    (date.getMonth() === originalDate.getMonth() + 1 ||
      date.getFullYear() === originalDate.getFullYear() + 1)
  ) {
    const returnDate = new Date(date.valueOf());
    returnDate.setDate(date.getDate() - 1);
    return returnDate;
  }

  const newDate = new Date(date.valueOf());
  newDate.setDate(date.getDate() + 1);
  return getLastOfMonth(newDate, originalDate ?? date);
};
