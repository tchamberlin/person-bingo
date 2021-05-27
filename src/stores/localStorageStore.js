import { writable } from 'svelte/store';

const localStoragePrefix = 'board';

const initStore = (data) => {
  const _data = {};
  Object.keys(data).forEach((key) => {
    const value = JSON.parse(localStorage.getItem('board'));
    if (value) {
      _data[key] = value;
    }
  });
  const store = writable(_data);
  store.subscribe((storeValue) =>
    Object.entries(_data).forEach(([key, value]) => {
      console.log('Set', key, 'to', value);
      localStorage.setItem(key, JSON.stringify(value));
    })
  );
  return store;
};

export default initStore;
