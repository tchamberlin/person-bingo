export function genRandomString(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
}

export function chunk(arr: Array<any>, len: number): Array<any> {
  const chunks = [];
  let i = 0;
  const n = arr.length;
  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }
  return chunks;
}

// From https://stackoverflow.com/a/6274398/1883424
export function shuffle(array: Array<any>, random: any): Array<any> {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(random.quick() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}
