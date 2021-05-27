import { writable } from 'svelte/store';
import { DEFAULT_WIN_CONDITION } from './defaults';

const initLocalStorageStore = (key, defaultValue) => {
  if (typeof defaultValue === 'undefined') {
    defaultValue = null;
  }
  const store = writable(JSON.parse(localStorage.getItem(key)) || defaultValue);
  store.subscribe((value) => {
    console.debug(`Wrote to ${key} store:`, value);
    localStorage.setItem(key, JSON.stringify(value));
  });
  return store;
};

export const boardStore = initLocalStorageStore('board', []);
export const promptsStore = initLocalStorageStore('prompts', []);
export const seedStore = initLocalStorageStore('seed');
export const winConditionStore = initLocalStorageStore('winCondition', DEFAULT_WIN_CONDITION);
export const victoryStore = initLocalStorageStore('victory', false);
export const originalBoardUrlStore = initLocalStorageStore('originalBoardUrl');