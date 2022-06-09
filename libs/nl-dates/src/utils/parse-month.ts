import { getOrdinalIndex } from './get-ordinal-index';
import { months } from '../ordinals/months';

export const parseMonth = (month: string | undefined, from: Date) => {
  if (!month) {
    return undefined;
  }

  const numberMonth = Number(month);

  if (Number.isNaN(numberMonth)) {
    return getOrdinalIndex(month, months, from.getMonth());
  }

  return numberMonth - 1;
};
