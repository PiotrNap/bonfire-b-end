export const unixTime = Math.floor(Date.now());
export const isoTime = new Date(Math.floor(Date.now())).toISOString();
export const expiry = new Date(Math.floor(Date.now()) + 1000 * 3600);
export const expirationTime = expiry.toLocaleTimeString();
export const expirationDate = expiry.toLocaleDateString();
export const localTime = new Date(Math.floor(Date.now())).toLocaleTimeString();
export const localDate = new Date(Math.floor(Date.now())).toLocaleDateString();
export const utcTime = new Date(Math.floor(Date.now())).toUTCString();
export const argCounter = (...i) => {let argCounter = 0;for (let acc of i) argCounter++;return argCounter;};
export const elementCounter = (i) => {let elemCounter = 0;for (let acc of i) elemCounter++;return elemCounter;};
export const sum = (i: number[]) => {return i.reduce((a, b) => a + b, 0);};
export const stripSentence = (i) => {let re = /(\.)/;return i.split(re).filter((i) => i != "" && i != ".");}

export const stripWords = (i) => {
  for (let x of i) {
  }
  i = i.replace(".", "");
  i = i.replace(",", "");
  i = i.replace(":", "");
  i = i.replace(";", "");
  return i.split(" ");
}

export const stripValues = (r) => {
  let res = [];
  for (let i of r) {
    res.push(i);
  }
  return res;
}

export const stripType = (r) => {
  let res = [];
  for (let i of r) {
    // console.log(typeof(i))
    res.push(typeof i);
  }
  return res;
}

export const range = (s, e) =>
  e > s
    ? Array(e - s + 1)
        .fill(0)
        .map((x, y) => y + s)
    : Array(s - e + 1)
        .fill(0)
        .map((x, y) => -y + s);
