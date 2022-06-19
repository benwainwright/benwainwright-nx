import { isSameDate } from '@benwainwright/utils';

export const getDaysInBetween = (from: Date, to: Date): Date[] => {
  if (isSameDate(from, to)) {
    return [];
  }

  const incrementedFrom = new Date(from.valueOf());
  incrementedFrom.setDate(incrementedFrom.getDate() + 1);

  const returnVal = [from, ...getDaysInBetween(incrementedFrom, to)];
  return returnVal;
};
