import { writable } from 'svelte/store';

import { DEFAULT_WIN_CONDITION } from '../defaults';
import initLocalStorageStore from './localStorageStore';

export const boardStore = initLocalStorageStore('board', []);
export const promptsStore = initLocalStorageStore('prompts', []);
export const seedStore = initLocalStorageStore('seed');
export const winConditionStore = initLocalStorageStore('winCondition', DEFAULT_WIN_CONDITION);
export const victoryStore = initLocalStorageStore('victory', false);
export const originalBoardUrlStore = initLocalStorageStore('originalBoardUrl');
export const allowShuffleStore = initLocalStorageStore('allowShuffle');
