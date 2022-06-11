export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    var random = (Math.random() * 16) | 0,
      replaceString = char == 'x' ? random : (random & 0x3) | 0x8;
    return replaceString.toString(16);
  });
};
