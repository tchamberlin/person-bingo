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
    background: #ffa756 !important;
    color: black;
    cursor: default;
  }
  .active {
    transition: 0.5s;
    /* pale blue */
    background: #d0fefe !important;
    color: black;
    cursor: default;
  }
  .win {
    transition: 0.5s;
    /* pale green */
    background: #c7fdb5 !important;
    color: black;
    cursor: default;
  }
  td:nth-child(even) {
    background-color: #f2f2f2;
  }
  th:nth-child(even) {
    background-color: #f2f2f2;
  }
  .table td, .table th {
    padding: 0.5rem;
  }
</style>

<script>
  function genRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
  };

  function chunk (arr, len) {
    const chunks = [];
    let i = 0;
    const n = arr.length;
    while (i < n) {
    chunks.push(arr.slice(i, i += len));
    }
    return chunks;
  }

  function shuffle(array, random) {
    return [...Array(array.length).keys()].sort(() => random.quick() - 0.5)
  }

  function genBoard({resetSeed = false} = {}) {
    let seed = localStorage.getItem("bingo-seed");
    console.log(`Got seed ${seed}`)
    if (seed == null || resetSeed) {
      seed = genRandomString()
      console.log(`Set seed to ${seed}`)
      localStorage.setItem("bingo-seed", seed)
    }
    const random = new Math.seedrandom(JSON.stringify(seed));
    const params = new URLSearchParams(location.search)
    const cells = params.getAll(CELL_PARAM_KEY)
    if (cells.length < 25) {
      console.log("bailing out!")
      localStorage.removeItem("bingo-board")
      return [];
    }
    const indices = shuffle(cells, random)
    const ordered = indices.map(i => cells[i])
    const free_i = ordered.indexOf(FREE_SPACE)
    const middle_i = 12
    // Swap the free space into the middle
    ordered[free_i] = ordered[middle_i]
    ordered[middle_i] = FREE_SPACE
    // Generate the cell objects
    const o2 = ordered.map(cell => (
      {
        title: cell,
        value: "",
        state: {
          found: cell === FREE_SPACE,
          active: false,
          win: false,
          duplicate: false,
        }
      }
    ))
    const board = chunk(o2.slice(0, 25), 5)
    // Save the board to localStorage (so it will survive refreshes, etc)
    localStorage.setItem("bingo-board", JSON.stringify(board))
    checkBoard(board)
    return board
  }

  function getCellClass(cell) {
    if (cell.state.active) {
      return "active"
    } else if (cell.state.duplicate) {
      return "duplicate"
    } else if (cell.state.win) {
      return "win"
    } else if (cell.state.found) {
      return "found"
    } else {
      return "not_found"
    }
  }

  function handleClick(event, col, row) {
    // Ignore clicks on the free space
    if (board[col][row].title === FREE_SPACE) {
      return
    }

    document.getElementById(`${col}x${row}`).focus();
  }

  function handleSelectInput(event, col, row) {
    board[col][row].state.active = true
  }

  function checkRowWin(board) {
    let wonCells = [];
    board.forEach((row, ri) => {
      if (row.every(cell => cell.state.found && !cell.state.duplicate)) {
        row.forEach((cell, ci) => wonCells.push(`${ri}x${ci}`))
      }
    });
    return wonCells;
  }

  function checkColWin(board) {
    let wonCells = [];
    // TODO: will break with non-square boards
    [...Array(board.length).keys()].forEach(ci => {
        if (board.every(row => row[ci].state.found && !row[ci].state.duplicate)) {
            board.forEach((row, ri) => wonCells.push(`${ri}x${ci}`));
        }
    });
    return wonCells;
  }

  function checkDiagonalWin(board) {
    let wonCells = [];
    const ix = [...Array(board.length).keys()];
    if (ix.every(i => board[i][i].state.found)) {
      ix.forEach(i => wonCells.push(`${ri}x${ci}`))
      

    }
    if (ix.every(i => board[board.length - 1 - i][i].state.found)) {
      ix.forEach(i => wonCells.push(`${board.length - 1 - i}x${i}`))
    }
    return wonCells;
  }

  function checkBoard(board) {
    const allValues = [];
    board.forEach((row, ri) => row.forEach((cell, ci) => {
      if (cell.value.trim() !== "") {
        allValues.push(cell.value.trim())
      }
    }));

    // Check duplicates first
    board.forEach((row, ri) => row.forEach((cell, ci) => {
      board[ri][ci].state.duplicate = allValues.filter(
        value => value.trim().toLowerCase() === cell.value.toLowerCase()
      ).length > 1;
    }));

    const wonCells = [...checkRowWin(board), ...checkDiagonalWin(board), ...checkColWin(board)];
    board.forEach((row, ri) => row.forEach((cell, ci) => {
      board[ri][ci].state.win = wonCells.indexOf(`${ri}x${ci}`) !== -1
    }));

  }

  function handleLeaveInput(event, row, col) {
    // If there is text in the input, set "found" to true
    board[row][col].state.found = Boolean(event.target.value)
    board[row][col].state.active = false

    const boardStr = JSON.stringify(board)
    localStorage.setItem("bingo-board", boardStr)
    checkBoard(board)
  }

  function handleNewSeed(event) {
    // global
    board = genBoard({resetSeed: true});
  }

  function handleSubmit() {
    if (userIsSureTheyWantToSubmit) {
      handleNewSeed()
      userIsSureTheyWantToSubmit = false;
    } else {
      userIsSureTheyWantToSubmit = true;
    }
  }

  function handleClear() {
    if (userIsSureTheyWantToClear) {
      board = genBoard();
      userIsSureTheyWantToClear = false;
    } else {
      userIsSureTheyWantToClear = true;
    }
  }

  const FREE_SPACE = "Free Space";
  const CELL_PARAM_KEY = "c";
  const BINGO_LETTERS = "BINGO";
  const url = new URL(location)
  const resetBoardRequested = Boolean(url.searchParams.get("clear"))
  
  
  const boardStr = localStorage.getItem("bingo-board");
  let board;
  if (boardStr == null || resetBoardRequested) {
    board = genBoard();
    if (resetBoardRequested) {
      url.searchParams.delete("clear")
      console.log("Cleared board due to clear= URL param")
      window.location = url;
    }
  } else {
    board = JSON.parse(boardStr);
    if (url.searchParams.get("c") == null) {
      board.forEach(row => row.forEach(cell => url.searchParams.append("c", cell.title)))
      window.location = url;
    }

    checkBoard(board)
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
        on:click={handleClear}
        class="btn"
        class:btn-secondary={!userIsSureTheyWantToClear}
        class:btn-danger={userIsSureTheyWantToClear}
        on:blur={() => {userIsSureTheyWantToClear = false} }
        title="Clear all text inputs from the board (but keep everything else the same)"
      >
        {userIsSureTheyWantToClear ? "Are You Sure?" : "Clear Board"}
      </button>
    </div>
    <div class="p-2">
      <button
        on:click={handleSubmit}
        class="btn"
        class:btn-warning={!userIsSureTheyWantToSubmit}
        class:btn-danger={userIsSureTheyWantToSubmit}
        on:blur={() => {userIsSureTheyWantToSubmit = false} }
        title="Shuffle locations of board spaces, but use the same words. Also clears all text inputs."
      >
        {userIsSureTheyWantToSubmit ? "Are You Sure? This will clear all of your inputs and rearrange your board" : "Shuffle Board"}
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
      {#each board as rowz, riz}
      <tr>
        <th class="align-middle">{riz+1}</th>
        {#each rowz as cell, ciz}
        <td
          class="bingo-cell align-middle {getCellClass(cell)}"
          on:click={(event) => handleClick(event, riz, ciz)}
        >
          {#if false}
          <code>{JSON.stringify(cell)}</code>
          {/if}
          <span class="bingo-cell-text" >
            {cell.title}
          </span>
          <br>
          {#if cell.title !== FREE_SPACE}
          <input
            on:focus={(event) => handleSelectInput(event, riz, ciz)}
            on:blur={(event) => handleLeaveInput(event, riz, ciz)}
            bind:value={board[riz][ciz].value}
            type="text"
            id="{riz}x{ciz}"
            name="{riz}x{ciz}"
            placeholder="answer"
            class="form-control"
          >
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
