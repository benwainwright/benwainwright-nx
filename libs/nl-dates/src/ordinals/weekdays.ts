export const weekDays = [
  ['sunday', 'sun'],
  ['monday', 'mon'],
  ['tuesday', 'tue', 'tues'],
  ['wednesday', 'wed'],
  ['thursday', 'thurs', 'thur'],
  ['friday', 'fri'],
  ['saturday', 'sat'],
] as const;

export type WeekDays = typeof weekDays[number][0];

export const weekdaysPiped = weekDays.flat().join(`|`);
