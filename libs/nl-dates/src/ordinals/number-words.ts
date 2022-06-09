export const wordNumbers = [
  // Needs to be here to make 'first' get a 1 index
  [],
  ['first'],
  ['second'],
  ['third'],
  ['fourth'],
  ['fifth'],
  ['sixth'],
  ['seventh'],
  ['eigth'],
  ['ninth'],
  ['tenth'],
  ['eleventh'],
  ['twelth'],
  ['thirteenth'],
  ['fourteenth'],
  ['fifteenth'],
  ['sixteenth'],
  ['seventeenth'],
  ['eighteenth'],
  ['nineteenth'],
  ['twentieth'],
  ['twentyfirst', 'twenty-first'],
  ['twentysecond', 'twenty-scond'],
  ['twentythird', 'twenty-third'],
  ['twentyfourth', 'twenty-fourth'],
  ['twentyfifth', 'twenty-fifth'],
  ['twentysixth', 'twenty-sixth'],
  ['twentyseventh', 'twenty-seventh'],
  ['twentyeighth', 'twenty-eighth'],
  ['twentyninth', 'twenty-ninth'],
  ['thirtieth'],
  ['thirtyfirst', 'thirty-first'],
];

export const daysPiped = wordNumbers.flat().join('|');

export const alternatingWordnumbersPiped = [
  'other',
  ...wordNumbers.flat(),
].join('|');

export const nthWeekdayOptionsPiped = ['last', ...wordNumbers.slice(0, 5)].join(
  '|'
);
