<style type="text/css">
  .not_found {
    cursor: pointer;
    transition: 0.5s;
  }
  .found {
    /* sky blue */
    background-color: #75bbfd !important;
    transition: 0.5s;
    color: black;
    cursor: pointer;
  }
  .duplicate {
    transition: 0.5s;
    /* pale orange */
    background-color: #ffa756 !important;
    color: black;
    cursor: default;
  }
  .active {
    transition: 0.5s;
    /* pale blue */
    background-color: #d0fefe !important;
    color: black;
    cursor: default;
  }
  .win {
    transition: 0.5s;
    /* pale green */
    background-color: #c7fdb5 !important;
    color: black;
    cursor: default;
  }
  td:nth-child(even) {
    background-color: #f2f2f2;
  }
  th:nth-child(even) {
    background-color: #f2f2f2;
  }
  .table td,
  .table th {
    padding: 0.5rem;
  }
</style>

<script lang="ts">
  import seedrandom from 'seedrandom';
  import suggestions from './suggested_prompts';
  import { genRandomString, chunk, shuffle } from './utils.ts';
  import Nav from './Nav.svelte';

  interface Cell {
    title: string;
    value: string;
    state: {
      found: boolean;
      active: boolean;
      win: boolean;
      duplicate: boolean;
    };
  }
  type Row = Array<Cell>;
  type Board = Array<Row>;

  function genBoard({ resetSeed = false } = {}) {
    let seed: string = localStorage.getItem('bingo-seed');
    console.log(`Got seed ${seed}`);
    if (seed == null || resetSeed) {
      seed = genRandomString();
      console.log(`Set seed to ${seed}`);
      localStorage.setItem('bingo-seed', seed);
    }
    // TODO Make interface
    const random = seedrandom(JSON.stringify(seed));
    const params = new URLSearchParams(location.search);
    let prompts: Set<string> = [...new Set(params.getAll(CELL_PARAM_KEY))];
    if (prompts.length < 25) {
      console.error('Not enough prompts!');
      // TODO: error message
      return [];
    }
    prompts = shuffle(prompts, random);
    const middle_i: number = 12;
    // Swap the free space into the middle
    prompts[middle_i] = FREE_SPACE;
    // Generate the cell objects
    const cells: Array<Cell> = prompts.map((title: string) => ({
      title: title,
      value: '',
      state: {
        found: title === FREE_SPACE,
        active: false,
        win: false,
        duplicate: false,
      },
    }));
    const board: Board = chunk(cells.slice(0, 25), 5);
    // Save the board to localStorage (so it will survive refreshes, etc)
    localStorage.setItem('bingo-board', JSON.stringify(board));
    checkBoard(board);
    return board;
  }

  function shuffleBoard() {
    // Must reset the seed in order to get a different shuffle than before
    const seed = genRandomString();
    console.log(`Set seed to ${seed}`);
    localStorage.setItem('bingo-seed', seed);
    const random = seedrandom(JSON.stringify(seed));

    // Now grab the board out of local storage...
    let prompts: Array<string> = [];
    const previousBoard: Board = JSON.parse(localStorage.getItem('bingo-board'));
    previousBoard.forEach((row: Array<Cell>) => {
      row.forEach((cell: Cell) => {
        // Grab titles of all cells except he free space
        if (cell.title !== FREE_SPACE) {
          prompts.push(cell.title);
        }
      });
    });
    // ...shuffle it...
    prompts = shuffle(prompts, random);
    const middle_i: number = 12;
    // Swap the free space into the middle
    prompts[middle_i] = FREE_SPACE;
    // Generate the cell objects
    const cells: Array<Cell> = prompts.map((title: string) => ({
      title: title,
      value: '',
      state: {
        found: title === FREE_SPACE,
        active: false,
        win: false,
        duplicate: false,
      },
    }));
    const newBoard: Board = chunk(cells.slice(0, 25), 5);
    // ...and put it back
    localStorage.setItem('bingo-board', JSON.stringify(newBoard));
    return newBoard;
  }

  function getCellClass(cell: Cell): string {
    if (cell.state.active) {
      return 'active';
    } else if (cell.state.duplicate) {
      return 'duplicate';
    } else if (cell.state.win) {
      return 'win';
    } else if (cell.state.found) {
      return 'found';
    } else {
      return 'not_found';
    }
  }

  function handleClick(col: number, row: number): void {
    // Ignore clicks on the free space
    if (board[col][row].title === FREE_SPACE) {
      return;
    }

    document.getElementById(`${col}x${row}`).focus();
  }

  function handleSelectInput(col: number, row: number): void {
    board[col][row].state.active = true;
  }

  function checkRowWin(board: Board): Array<string> {
    let wonCells = [];
    board.forEach((row: Array<Cell>, ri: number) => {
      if (row.every((cell: Cell) => cell.state.found && !cell.state.duplicate)) {
        row.forEach((_, ci: number) => wonCells.push(`${ri}x${ci}`));
      }
    });
    return wonCells;
  }

  function checkColWin(board: Board): Array<string> {
    let wonCells = [];
    // TODO: will break with non-square boards
    [...Array(board.length).keys()].forEach((ci: number) => {
      if (board.every((row: Array<Cell>) => row[ci].state.found && !row[ci].state.duplicate)) {
        board.forEach((_, ri: number) => wonCells.push(`${ri}x${ci}`));
      }
    });
    return wonCells;
  }

  function checkDiagonalWin(board: Board): Array<string> {
    let wonCells = [];
    const ix = [...Array(board.length).keys()];
    if (ix.every((i: number) => board[i][i].state.found)) {
      ix.forEach((i: number) => wonCells.push(`${i}x${i}`));
    }
    if (ix.every((i: number) => board[board.length - 1 - i][i].state.found)) {
      ix.forEach((i: number) => wonCells.push(`${board.length - 1 - i}x${i}`));
    }
    return wonCells;
  }

  function checkLineWin(board: Board) {
    const wonCells = [...checkRowWin(board), ...checkDiagonalWin(board), ...checkColWin(board)];
    return wonCells;
  }

  function checkFourCornersWin(board: Board): void {
    return board[0][0].state.found &&
      board[0][4].state.found &&
      board[4][0].state.found &&
      board[4][4].state.found
      ? ['0x0', '0x4', '4x0', '4x4']
      : [];
  }

  function checkBlackoutWin(board: Board): void {
    let win = true;
    board.forEach((row: Array<Cell>) =>
      row.forEach((cell: Cell) => {
        if (!cell.state.found || cell.state.duplicate) {
          win = false;
        }
        // break;
      })
    );

    let wonCells = [];
    if (win) {
      board.forEach((row, ri: number) =>
        row.forEach((_, ci: number) => {
          wonCells.push(`${ri}x${ci}`);
        })
      );
    }
    return wonCells;
  }

  function checkBoard(board: Board): void {
    const allValues = [];
    board.forEach((row: Array<Cell>) =>
      row.forEach((cell: Cell) => {
        if (cell.value.trim() !== '') {
          allValues.push(cell.value.trim());
        }
      })
    );

    // Check duplicates first
    board.forEach((row: Array<Cell>, ri: number) =>
      row.forEach((cell: Cell, ci: number) => {
        board[ri][ci].state.duplicate =
          allValues.filter((value) => value.trim().toLowerCase() === cell.value.toLowerCase())
            .length > 1;
      })
    );

    const wonCells = RULES[WIN_CONDITION].function(board);

    board.forEach((row: Array<Cell>, ri: number) =>
      row.forEach((_, ci: number) => {
        board[ri][ci].state.win = wonCells.indexOf(`${ri}x${ci}`) !== -1;
      })
    );

    VICTORY = Boolean(wonCells.length);
  }

  function handleLeaveInput(event: FocusEvent, row: number, col: number): void {
    // If there is text in the input, set "found" to true
    board[row][col].state.found = Boolean((<HTMLInputElement>event.target).value);
    board[row][col].state.active = false;

    const boardStr = JSON.stringify(board);
    localStorage.setItem('bingo-board', boardStr);
    checkBoard(board);
  }

  function handleShuffle(): void {
    if (userIsSureTheyWantToSubmit) {
      board = shuffleBoard();
      userIsSureTheyWantToSubmit = false;
    } else {
      userIsSureTheyWantToSubmit = true;
    }
  }

  function handleClear(): void {
    if (userIsSureTheyWantToClear) {
      board = genBoard();
      userIsSureTheyWantToClear = false;
    } else {
      userIsSureTheyWantToClear = true;
    }
  }

  let VICTORY = false;
  const FREE_SPACE = 'Free Space';
  const CELL_PARAM_KEY = 'c';
  const WIN_CONDITION_PARAM_KEY = 'goal';
  const BINGO_LETTERS = 'BINGO';
  const url: URL = new URL(location.href);
  let WIN_CONDITION = url.searchParams.get(WIN_CONDITION_PARAM_KEY) || 'line';

  const RULES = {
    line: {
      name: 'Standard',
      blurb: 'complete either a horizontal, vertical, OR diagonal line',
      function: checkLineWin,
    },
    'four-corners': {
      name: 'Four Corners',
      blurb: 'complete all four corners of the board',
      function: checkFourCornersWin,
    },
    blackout: {
      name: 'Blackout',
      blurb: 'complete EVERY square on the board',
      function: checkBlackoutWin,
    },
  };

  // If 'clear' is given as a param, regardless of its value, user has requested
  // a board reset
  const resetBoardRequested: boolean = url.searchParams.get('clear') !== null;
  if (resetBoardRequested) {
    console.log('Cleared board due to clear= URL param');
    url.searchParams.delete('clear');
    localStorage.removeItem('bingo-board');
    window.location.assign(url.toString());
  }

  const boardStr = localStorage.getItem('bingo-board');
  let board: Board;
  if (boardStr == null) {
    console.log('No saved board in localStorage; creating a new one');
    board = genBoard();
  } else {
    board = JSON.parse(boardStr);
    console.log('Found board in localStorage');

    checkBoard(board);
  }
  url.searchParams.delete(CELL_PARAM_KEY);
  if (window.location.toString() !== url.href) {
    window.location.assign(url.href);
  }

  let userIsSureTheyWantToSubmit = false;
  let userIsSureTheyWantToClear = false;
  let nav_open = false;
  console.log('here');
</script>

<Nav active="play" />
<main role="main" class="container">
  {#if board.length}
    <div class="d-flex flex-row align-items-center">
      <div class="p-2">
        <h1>Bingo</h1>
      </div>
      <div class="p-2">
        <button
          on:click="{handleClear}"
          class="btn btn-sm"
          class:btn-secondary="{!userIsSureTheyWantToClear}"
          class:btn-danger="{userIsSureTheyWantToClear}"
          on:blur="{() => {
            userIsSureTheyWantToClear = false;
          }}"
          title="Clear all text inputs from the board (but keep everything else the same)"
        >
          {userIsSureTheyWantToClear ? 'Are You Sure?' : 'Clear Board'}
        </button>
      </div>
      <div class="p-2">
        <button
          on:click="{handleShuffle}"
          class="btn btn-sm"
          class:btn-warning="{!userIsSureTheyWantToSubmit}"
          class:btn-danger="{userIsSureTheyWantToSubmit}"
          on:blur="{() => {
            userIsSureTheyWantToSubmit = false;
          }}"
          title="Shuffle locations of board spaces, but use the same words. Also clears all text inputs."
        >
          {userIsSureTheyWantToSubmit
            ? 'Are You Sure? This will clear all of your inputs and rearrange your board'
            : 'Shuffle Board'}
        </button>
      </div>

      <div class="ml-auto p-2">
        <span><strong>{RULES[WIN_CONDITION].name}</strong>: {RULES[WIN_CONDITION].blurb}.</span>
      </div>
      {#if VICTORY}
        <div class="p-2">
          <span>YOU'VE WON</span>
        </div>
      {/if}
    </div>
    <table class="table table-bordered">
      <thead>
        <th></th>
        {#each BINGO_LETTERS as letter}
          <th class="text-center">{letter}</th>
        {/each}
      </thead>
      <tbody>
        {#each board as row, ri}
          <tr>
            <th class="align-middle">{ri + 1}</th>
            {#each row as cell, ci}
              <td
                class="bingo-cell align-middle {getCellClass(cell)}"
                on:click="{() => handleClick(ri, ci)}"
              >
                {#if false}
                  <code>{JSON.stringify(cell)}</code>
                {/if}
                <span class="bingo-cell-text">
                  {cell.title}
                </span>
                <br />
                {#if cell.title !== FREE_SPACE}
                  <input
                    on:focus="{() => handleSelectInput(ri, ci)}"
                    on:blur="{(event) => handleLeaveInput(event, ri, ci)}"
                    bind:value="{board[ri][ci].value}"
                    type="text"
                    id="{ri}x{ci}"
                    name="{ri}x{ci}"
                    placeholder="answer"
                    class="form-control"
                  />
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div>
      <h1>Bingo</h1>
      <p>
        Boards must be at least 25 <b>unique</b> prompts (got only {board.length})! You've probably
        used an invalid URL.
      </p>
      <p>Navigate <a href="./index.html">here</a> to create a new one!</p>
    </div>
  {/if}
</main>
