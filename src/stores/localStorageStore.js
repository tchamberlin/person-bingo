import { writable } from 'svelte/store';

const initLocalStorageStore = (key, defaultValue) => {
  if (typeof defaultValue === 'undefined') {
    defaultValue = null;
  }
  const store = writable(JSON.parse(localStorage.getItem(key)) || defaultValue);
  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
    console.debug(`Wrote to ${key} store:`, value);
  });
  return store;
};

export default initLocalStorageStore;
