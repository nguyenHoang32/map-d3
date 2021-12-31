export const color = {
  green: "#2ac161",
  stroke: "#17162a",
  dark: "#212137"
}
export const inRange = (x, min, max) => {
  return (x - min) * (x - max) <= 0;
}
export const isEmpty = (obj) => {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}