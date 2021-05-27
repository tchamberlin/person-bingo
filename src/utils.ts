import seedrandom from 'seedrandom';

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

// Adapted from https://stackoverflow.com/a/6274398/1883424
export function shuffle(array: Array<any>, seed: string): Array<any> {
  let random;
  if (seed) {
    console.log('Shuffling deterministically from seed', seed);
    random = seedrandom(seed).quick;
  } else {
    console.log('Shuffling randomly');
    random = Math.random;
  }

  let counter = array.length;

  let _array = [...array];
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = _array[counter];
    _array[counter] = _array[index];
    _array[index] = temp;
  }

  console.log('SHUFFLE', array, 'to', _array);
  return _array;
}
