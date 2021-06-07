<script lang="ts">
  import { genRandomString, chunk, shuffle, genBoardUrl } from './utils';
  import { RULES, checkBoard } from './rules';
  import type { Cell } from './types';
  import { PARAM_KEYS } from './paramKeys';
  import { DEFAULT_FREE_SPACE, DEFAULT_BINGO_LETTERS, DEFAULT_WIN_CONDITION } from './defaults';
  import {
    boardStore,
    seedStore,
    promptsStore,
    winConditionStore,
    victoryStore,
    boardNameStore,
    allowShuffleStore,
    maxDuplicatesStore,
  } from './stores/boardStore';

  import Board from './Board.svelte';
  import BoardToolbar from './BoardToolbar.svelte';
  import MessageAlerts from './MessageAlerts.svelte';
  import Nav from './Nav.svelte';
  import RulesModal from './RulesModal.svelte';
  import WinModal from './WinModal.svelte';
  import {
    density as confettiDensity,
    startConfetti,
    stopConfetti,
    toggleConfetti,
    confettiIsActive,
  } from './confetti';

  const numCellsInBoard = DEFAULT_BINGO_LETTERS.length ** 2;

  // TODO: Consolidate
  function handleCopyToClipboard(text: string, message?: string): void {
    const promise = navigator.clipboard.writeText(text);
    // TODO: Add error messageAlert, too!
    promise.then(
      () => (messageAlerts = [...messageAlerts, { message: message || 'Copied to clipboard' }]),
      () => console.log('FAILURE')
    );
  }

  function genCell(title) {
    return {
      title: title,
      value: '',
      state: {
        found: title === DEFAULT_FREE_SPACE,
        active: false,
        win: false,
        duplicate: false,
        immediateDuplicate: false,
      },
    };
  }

  function genBoard({ resetSeed = false } = {}): void {
    if ($seedStore == null || resetSeed) {
      $seedStore = genRandomString();
      console.log('Generated new seed:', $seedStore);
    }

    if ($promptsStore.length === 0) {
      console.log('No prompts; bailing out of board gen');
      return;
    }

    // TODO Make interface
    let prompts = shuffle($promptsStore, $seedStore);
    // Put the free space in the middle square
    prompts = [
      ...prompts.slice(0, Math.floor(numCellsInBoard / 2)),
      DEFAULT_FREE_SPACE,
      ...prompts.slice(Math.floor(numCellsInBoard / 2)),
    ];
    // Generate the cell objects
    const cells: Array<Cell> = prompts.map((title: string) => genCell(title));
    $boardStore = chunk(cells.slice(0, numCellsInBoard), DEFAULT_BINGO_LETTERS.length);
  }

  export function clearBoard() {
    const newBoard = [];
    $boardStore.forEach((row) => row.forEach(({ title }) => newBoard.push(genCell(title))));
    $boardStore = chunk(newBoard.slice(0, numCellsInBoard), DEFAULT_BINGO_LETTERS.length);
    stopConfetti();
  }

  const STATE = {
    WIN_MODAL_OPEN: false,
    RULES_MODAL_OPEN: false,
    ALLOW_SHUFFLE: true,
    DO_CLEAR_DATA: false,
  };

  const toggleModal = (name) => {
    console.debug('Toggle', name, 'from', STATE[name], 'to', !STATE[name]);
    STATE[name] = !STATE[name];
  };
  const url: URL = new URL(location.href);
  if (url.search.length) {
    if (url.searchParams.get(PARAM_KEYS.CLEAR) !== null) {
      console.info('Clearing all data!');
      STATE.DO_CLEAR_DATA = true;
      $boardStore = [];
      $promptsStore = [];
      $seedStore = null;
      $winConditionStore = DEFAULT_WIN_CONDITION;
      $victoryStore = false;
      $allowShuffleStore = true;
    }
  }

  const winCondition = url.searchParams.get(PARAM_KEYS.WIN_CONDITION);
  if (winCondition && winCondition !== $winConditionStore) {
    $winConditionStore = winCondition;
  }
  let rule = RULES[$winConditionStore] || RULES[DEFAULT_WIN_CONDITION];

  let seedParam = url.searchParams.get(PARAM_KEYS.SEED) || null;
  console.log('seedParam', seedParam);
  if (seedParam !== null) {
    const seedChanged = seedParam !== $seedStore;
    if (seedChanged === true) {
      console.log('Seed changed from', $seedStore, 'to', seedParam);
      genBoard();
    }
    $seedStore = seedParam;
  }

  let allowShuffleParam = url.searchParams.get(PARAM_KEYS.ALLOW_SHUFFLE);
  if (allowShuffleParam) {
    $allowShuffleStore = true;
  }

  if ($boardStore.length === 0) {
    console.log('No saved board in localStorage; creating a new one');
    const params = new URLSearchParams(location.search);
    console.log('params from URL', params);
    // Get unique prompts from query params
    $promptsStore = [...new Set(params.getAll(PARAM_KEYS.CELL))].sort();
    genBoard();
  } else {
    console.log('Found board in localStorage (rechecking)', $boardStore);
    $victoryStore = checkBoard($boardStore, $winConditionStore, $maxDuplicatesStore);
  }

  let userIsSureTheyWantToSubmit = false;
  let userIsSureTheyWantToClear = false;

  // Watch the victory store; when it becomes true, open the win modal
  $: {
    if ($victoryStore === true) {
      window.setTimeout(() => toggleModal('WIN_MODAL_OPEN'), 300);
      startConfetti();
    } else {
      stopConfetti();
    }
  }
  if (STATE.DO_CLEAR_DATA || url.search.length) {
    window.history.replaceState({}, '', url.pathname);
    STATE.DO_CLEAR_DATA = false;
  }

  let boardNameParam = url.searchParams.get(PARAM_KEYS.BOARD_NAME);
  if (boardNameParam?.length) {
    $boardNameStore = boardNameParam;
  }
  let maxDuplicatesParam = url.searchParams.get(PARAM_KEYS.MAX_DUPLICATES);
  if (maxDuplicatesParam !== null) {
    $maxDuplicatesStore = maxDuplicatesParam;
  }

  const BINGO_URL = genBoardUrl({
    phrases: $promptsStore.join('\n'),
    win_condition: $winConditionStore,
    board_name: $boardNameStore,
    max_duplicates: $maxDuplicatesStore,
    seed: $seedStore,
  });
  let messageAlerts: Array<{ message: string }> = [];

</script>

<MessageAlerts messageAlerts="{messageAlerts}" />
<Nav active="play" />
<main role="main" class="container">
  {#if $boardStore?.length}
    {#if $boardNameStore}
      <div class="pe-4">
        <h1>{$boardNameStore}</h1>
      </div>
    {/if}
    <BoardToolbar
      handleCopyBoardUrl="{() =>
        handleCopyToClipboard(BINGO_URL.toString(), 'Copied full URL to clipboard')}"
      maxDuplicates="{$maxDuplicatesStore}"
      rule="{rule}"
      clearBoard="{clearBoard}"
      genBoard="{genBoard}"
      toggleRulesModal="{() => toggleModal('RULES_MODAL_OPEN')}"
      allowShuffle="{$allowShuffleStore}"
      enableConfetti="{$victoryStore}"
      toggleConfetti="{toggleConfetti}"
      confettiIsActive="{confettiIsActive}"
    />
    <Board
      freeSpace="{DEFAULT_FREE_SPACE}"
      bingoLetters="{DEFAULT_BINGO_LETTERS}"
      winCondition="{$winConditionStore}"
    />
  {:else}
    <div>
      <h1>{$boardNameStore}</h1>
      <p>
        Boards must be at least {numCellsInBoard - 1} <strong>unique</strong> prompts (got only {$boardStore.length})!
        You've probably used an invalid URL.
      </p>
      <p>Navigate <a href="./index.html">here</a> to create a new one!</p>
    </div>
  {/if}
</main>
<WinModal isOpen="{STATE.WIN_MODAL_OPEN}" toggleModal="{() => toggleModal('WIN_MODAL_OPEN')}" />
<RulesModal
  isOpen="{STATE.RULES_MODAL_OPEN}"
  toggleModal="{() => toggleModal('RULES_MODAL_OPEN')}"
/>
