<style type="text/css">
  @media (max-width: 1025px) {
    .container {
      max-width: 95%;
    }
  }
  .not_found {
    cursor: pointer;
    transition: 0.5s;
  }
  .table td:nth-child(even) {
    background-color: #f2f2f2;
  }
  .table th:nth-child(even) {
    background-color: #f2f2f2;
  }
  .table td,
  .table th {
    padding: 0.5rem;
  }
  .found {
    /* sky blue */
    background-color: #75bbfd !important;
    color: black;
    cursor: pointer;
    transition: 0.5s;
  }
  .duplicate {
    /* pale orange */
    background-color: #ffa756 !important;
    color: black;
    cursor: default;
    transition: 0.5s;
  }
  .active {
    /* pale blue */
    background-color: #d0fefe !important;
    color: black;
    cursor: default;
    transition: 0.5s;
  }
  .win {
    /* pale green */
    background-color: #c7fdb5 !important;
    color: black;
    cursor: default;
    transition: 0.5s;
  }
  .free-space {
    cursor: default;
  }
</style>

<script lang="ts">
  import seedrandom from 'seedrandom';
  import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';

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

  // TODO: figure out how to set this up to keepvalues!
  function genBoard({ resetSeed = false, keepValues = false } = {}) {
    let seed: string = localStorage.getItem('bingo-seed');
    console.log('Got bingo-seed from localStorage:', seed);
    if (seed == null || resetSeed) {
      seed = genRandomString();
      console.log(`Set localStorage.bingo-seed to: ${seed}`);
      localStorage.setItem('bingo-seed', seed);
    }

    let prompts: Array<string> = JSON.parse(localStorage.getItem('bingo-prompts')) || [];
    console.log(`Got localStorage.prompts`, prompts);
    if (prompts.length === 0) {
      console.log('No prompts; bailing out of board gen');
      return [];
    }

    // TODO Make interface
    const random = seedrandom(JSON.stringify(seed));
    prompts = shuffle(prompts, random);
    // Put the free space in the middle square
    prompts = [...prompts.slice(0, 12), FREE_SPACE, ...prompts.slice(12)];
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
    console.log('saved board2', board);
    checkBoard(board);
    return board;
  }

  function getCellClass(cell: Cell): string {
    let cssClass = null;
    if (cell.state.active) {
      cssClass = 'active';
    } else if (cell.state.duplicate) {
      cssClass = 'duplicate';
    } else if (cell.state.win) {
      cssClass = 'win';
    } else if (cell.state.found) {
      cssClass = 'found';
    } else {
      cssClass = 'not_found';
    }

    if (cell.title == FREE_SPACE) {
      cssClass += ' free-space';
    }

    return cssClass;
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

  function checkWholeBoardWin(board: Board): void {
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

    // Debounce (sort of). This avoid having to close the modal multiple times, for example
    const nowVictory = Boolean(wonCells.length);
    if (VICTORY !== nowVictory) {
      VICTORY = Boolean(wonCells.length);
    }
    if (VICTORY) {
      window.setTimeout(() => (WIN_MODAL_OPEN = true), 100);
    }
  }

  function handleLeaveInput(event: FocusEvent, row: number, col: number): void {
    // If there is text in the input, set "found" to true
    board[row][col].state.found = Boolean((<HTMLInputElement>event.target).value);
    board[row][col].state.active = false;

    const boardStr = JSON.stringify(board);
    console.log('saved board', board);
    localStorage.setItem('bingo-board', boardStr);
    checkBoard(board);
  }

  function handleShuffle(): void {
    if (userIsSureTheyWantToSubmit) {
      board = genBoard({ resetSeed: true });
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

  let WIN_MODAL_OPEN = false;
  let RULES_MODAL_OPEN = false;
  const toggle_win_modal = () => (WIN_MODAL_OPEN = !WIN_MODAL_OPEN);
  const toggle_rules_modal = () => (RULES_MODAL_OPEN = !RULES_MODAL_OPEN);
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
      blurb: 'complete a horizontal, vertical, OR diagonal line',
      function: checkLineWin,
    },
    'four-corners': {
      name: 'Four Corners',
      blurb: 'complete all four corners of the board',
      function: checkFourCornersWin,
    },
    'whole-board': {
      name: 'Whole Board',
      blurb: 'complete EVERY square on the board',
      function: checkWholeBoardWin,
    },
  };

  const SEED_PARAM_KEY = 'seed';
  let SEED = localStorage.getItem('bingo-seed');
  let ALLOW_SHUFFLE = true;
  let seedParam = url.searchParams.get(SEED_PARAM_KEY) || null;
  if (seedParam !== null) {
    if (seedParam !== SEED) {
      console.log('Seed changed from', SEED, 'to', seedParam);
      genBoard();
    }
    SEED = seedParam;
    ALLOW_SHUFFLE = !Boolean(SEED);
    localStorage.setItem('bingo-seed', SEED);
    console.log('Got seed', SEED, 'from params; saved to localStorage');
  }

  // If 'clear' is given as a param, regardless of its value, user has requested
  // a board reset
  const resetBoardRequested: boolean = url.searchParams.get('clear') !== null;
  if (resetBoardRequested) {
    console.log('Cleared board due to clear= URL param');
    url.searchParams.delete('clear');
    // Clear out ALL localStorage, just to be safe!
    localStorage.clear();
    window.location.assign(url.toString());
  }

  const boardStr = localStorage.getItem('bingo-board');
  let board: Board;
  if (boardStr == null) {
    console.log('No saved board in localStorage; creating a new one');
    const params = new URLSearchParams(location.search);
    // Get unique prompts from query params
    let prompts: Array<string> = [...new Set(params.getAll(CELL_PARAM_KEY))].sort();
    localStorage.setItem('bingo-prompts', JSON.stringify(prompts));
    board = genBoard();
  } else {
    board = JSON.parse(boardStr);
    console.log('Found board in localStorage', board);

    checkBoard(board);
  }
  url.searchParams.delete(CELL_PARAM_KEY);
  if (window.location.toString() !== url.href) {
    window.location.assign(url.href);
  }

  let userIsSureTheyWantToSubmit = false;
  let userIsSureTheyWantToClear = false;
  let nav_open = false;
</script>

<Nav active="play" seed="{SEED}" />
<main role="main" class="container">
  {#if board.length}
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-xs-6">
          <div class="d-flex flex-row align-items-center">
            <div class="pr-2">
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
                {userIsSureTheyWantToClear ? '❌ Are You Sure?' : '❌ Clear Board'}
              </button>
            </div>
            {#if ALLOW_SHUFFLE}
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
                  {userIsSureTheyWantToSubmit ? '🔀 Are You Sure?' : '🔀 Clear & Shuffle Board'}
                </button>
              </div>
            {/if}
            <div class="p-2">
              <button
                on:click="{toggle_rules_modal}"
                class="btn btn-info btn-sm"
                title="What is this thing?"
              >
                📜 Rules
              </button>
            </div>
          </div>
        </div>
        <div class="col-xs-6 ml-auto text-right">
          <div>
            <small
              >Find people that match the prompt in each cell. A name can be used only once</small
            >
          </div>
          <div>
            <small>After you <strong>{RULES[WIN_CONDITION].blurb}</strong>, you win!</small>
          </div>
        </div>
      </div>
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
        Boards must be at least 25 <strong>unique</strong> prompts (got only {board.length})! You've
        probably used an invalid URL.
      </p>
      <p>Navigate <a href="./index.html">here</a> to create a new one!</p>
    </div>
  {/if}

  <Modal isOpen="{WIN_MODAL_OPEN}" toggle="{toggle_win_modal}">
    <ModalHeader toggle="{toggle_win_modal}">🙌 You've Won</ModalHeader>
    <ModalBody>
      <p>That's right, you're a winner!</p>
      <p>Even if you've accomplished nothing else today... you have this</p>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" on:click="{toggle_win_modal}">I'm a winner 😌</Button>
    </ModalFooter>
  </Modal>

  <Modal isOpen="{RULES_MODAL_OPEN}" toggle="{toggle_rules_modal}">
    <ModalHeader toggle="{toggle_rules_modal}">📜 Rules</ModalHeader>
    <ModalBody>
      <p>
        This is "person Bingo". It's a super cool way to get to know whoever else you've been
        convinced to play with.
      </p>
      <p>
        Unlike normal Bingo, in order <strong
          >to "mark" a cell, you will need to find a person that matches the prompt inside of it</strong
        >. For example, if B1 says "owns a motorcycle", then you would need to find someone who owns
        a motorcycle, then put there name into the text box in B1.
      </p>
      <p>
        In order to win, you will need to meet the <strong>Win Condition</strong> displayed to the
        top right of the board. In "standard" mode, for example, you could win if fill in B1 through
        B5 with 5 <strong>different</strong> names!
      </p>
      <p>
        A final note: <strong>nothing</strong> that you put into this website will leave your computer!
        All of the information is stored locally, and no one else has any way of seeing it.
      </p>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" on:click="{toggle_rules_modal}">Okay</Button>
    </ModalFooter>
  </Modal>
</main>
