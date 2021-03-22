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

  function genRandomString(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
  }

  function chunk(arr: Array<any>, len: number): Array<any> {
    const chunks = [];
    let i = 0;
    const n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, (i += len)));
    }
    return chunks;
  }

  // TODO: fix any. type is prng, but no idea how to specify that here
  function shuffle(array: Array<any>, random: any): Array<any> {
    return [...Array(array.length).keys()].sort(() => random.quick() - 0.5);
  }

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
    const cells: Array<string> = params.getAll(CELL_PARAM_KEY);
    if (cells.length < 25) {
      console.log('bailing out!');
      localStorage.removeItem('bingo-board');
      return [];
    }
    const indices: Array<number> = shuffle(cells, random);
    const ordered: Array<string> = indices.map((i: number) => cells[i]);
    const free_i: number = ordered.indexOf(FREE_SPACE);
    const middle_i: number = 12;
    // Swap the free space into the middle
    ordered[free_i] = ordered[middle_i];
    ordered[middle_i] = FREE_SPACE;
    // Generate the cell objects
    const o2: Array<Cell> = ordered.map((title: string) => ({
      title: title,
      value: '',
      state: {
        found: title === FREE_SPACE,
        active: false,
        win: false,
        duplicate: false,
      },
    }));
    const board: Array<Array<Cell>> = chunk(o2.slice(0, 25), 5);
    // Save the board to localStorage (so it will survive refreshes, etc)
    localStorage.setItem('bingo-board', JSON.stringify(board));
    checkBoard(board);
    return board;
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

  function checkRowWin(board: Array<Array<Cell>>): Array<string> {
    let wonCells = [];
    board.forEach((row: Array<Cell>, ri: number) => {
      if (row.every((cell: Cell) => cell.state.found && !cell.state.duplicate)) {
        row.forEach((_, ci: number) => wonCells.push(`${ri}x${ci}`));
      }
    });
    return wonCells;
  }

  function checkColWin(board: Array<Array<Cell>>): Array<string> {
    let wonCells = [];
    // TODO: will break with non-square boards
    [...Array(board.length).keys()].forEach((ci: number) => {
      if (board.every((row: Array<Cell>) => row[ci].state.found && !row[ci].state.duplicate)) {
        board.forEach((_, ri: number) => wonCells.push(`${ri}x${ci}`));
      }
    });
    return wonCells;
  }

  function checkDiagonalWin(board: Array<Array<Cell>>): Array<string> {
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

  function checkBoard(board: Array<Array<Cell>>): void {
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

    const wonCells = [...checkRowWin(board), ...checkDiagonalWin(board), ...checkColWin(board)];
    board.forEach((row: Array<Cell>, ri: number) =>
      row.forEach((_, ci: number) => {
        board[ri][ci].state.win = wonCells.indexOf(`${ri}x${ci}`) !== -1;
      })
    );
  }

  function handleLeaveInput(event: FocusEvent, row: number, col: number): void {
    // If there is text in the input, set "found" to true
    board[row][col].state.found = Boolean((<HTMLInputElement>event.target).value);
    board[row][col].state.active = false;

    const boardStr = JSON.stringify(board);
    localStorage.setItem('bingo-board', boardStr);
    checkBoard(board);
  }

  function handleNewSeed(): void {
    // global
    board = genBoard({ resetSeed: true });
  }

  function handleSubmit(): void {
    if (userIsSureTheyWantToSubmit) {
      handleNewSeed();
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

  const FREE_SPACE: string = 'Free Space';
  const CELL_PARAM_KEY: string = 'c';
  const BINGO_LETTERS: string = 'BINGO';
  const url: URL = new URL(location.href);
  // If 'clear' is given as a param, regardless of its value, user has requested
  // a board reset
  const resetBoardRequested: boolean = url.searchParams.get('clear') !== null;

  const boardStr = localStorage.getItem('bingo-board');
  let board: Array<Array<Cell>>;
  if (boardStr == null || resetBoardRequested) {
    board = genBoard();
    if (resetBoardRequested) {
      url.searchParams.delete('clear');
      console.log('Cleared board due to clear= URL param');
      window.location.assign(url.toString());
    }
  } else {
    board = JSON.parse(boardStr);
    if (url.searchParams.get('c') == null) {
      board.forEach((row: Array<Cell>) =>
        row.forEach((cell: Cell) => url.searchParams.append('c', cell.title))
      );
      window.location.assign(url.toString());
    }

    checkBoard(board);
  }

  let userIsSureTheyWantToSubmit = false;
  let userIsSureTheyWantToClear = false;
</script>

<div class="container">
  {#if board.length}
    <div class="d-flex flex-row align-items-center">
      <div class="p-2">
        <h1>Bingo</h1>
      </div>
      <div class="p-2">
        <button
          on:click="{handleClear}"
          class="btn"
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
          on:click="{handleSubmit}"
          class="btn"
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
      <div class="p-2">
        <a
          class="btn btn-info"
          href="./index.html"
          id="create-bingo-board"
          title="Enter new words to create a new board"
        >
          Create New Board
        </a>
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
      <p>Boards must be at least 25 items! You've probably used an invalid URL.</p>
      <p>Navigate <a href="./index.html">here</a> to create a new one!</p>
    </div>
  {/if}
</div>
