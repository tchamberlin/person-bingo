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

// TODO: fix any. type is prng, but no idea how to specify that here
export function shuffle(array: Array<any>, random: any): Array<any> {
  const shuffled_indices = [...Array(array.length).keys()].sort(() => random.quick() - 0.5);
  return shuffled_indices.map((i: number) => array[i]);
}
