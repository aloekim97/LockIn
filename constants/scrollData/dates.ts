export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export const years = Array.from({ length: 21 }, (_, i) =>
  (2020 + i).toString()
);
