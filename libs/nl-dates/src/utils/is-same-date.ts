export const isSameDate = (dateOne: Date, dateTwo: Date) =>
    dateOne === dateTwo ||
    (dateOne.getDate() === dateTwo.getDate() &&
        dateOne.getMonth() === dateTwo.getMonth() &&
        dateOne.getFullYear() === dateTwo.getFullYear())
