export const groupOrderedDatesByMonth = (dates: Date[]): Date[][] =>
  dates.reduce<Date[][]>((accum, item, index) => {
    if (index === 0) {
      accum.push([item]);
      return accum;
    }

    const lastArray = accum[accum.length - 1];
    const lastDate = lastArray[lastArray.length - 1];

    if (lastDate.getMonth() === item.getMonth()) {
      lastArray.push(item);
      return accum;
    }

    accum.push([item]);
    return accum;
  }, []);
