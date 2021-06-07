import seedrandom from 'seedrandom';
import { PARAM_KEYS } from './paramKeys';

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
export function shuffle(array: Array<any>, seed?: string): Array<any> {
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

export function genSeed(prefix?: string): string {
  let seed: string;
  if (prefix) {
    seed = `${prefix.replaceAll(/\s+/g, '_')}-${genRandomString()}`;
  } else {
    seed = genRandomString();
  }
  return seed;
}

// TODO: optionally give seed?
export function genBoardUrl({ phrases, win_condition, board_name, max_duplicates, seed }): URL {
  if (typeof seed === 'undefined') {
    seed = genSeed();
  }

  const url = new URL('/bingo.html', window.location.toString());
  // const url = new URL('https://person-bingo.vercel.app/bingo.html');
  phrases.split('\n').forEach((phrase: string) => {
    const trimmed: string = phrase.trim();
    if (trimmed.length) {
      url.searchParams.append('c', trimmed);
    }
  });

  url.searchParams.append(PARAM_KEYS.CLEAR, 'true');
  url.searchParams.append(PARAM_KEYS.WIN_CONDITION, win_condition);
  url.searchParams.append(PARAM_KEYS.SEED, seed);
  url.searchParams.append(PARAM_KEYS.BOARD_NAME, board_name);
  url.searchParams.append(PARAM_KEYS.MAX_DUPLICATES, max_duplicates);

  return url;
}
