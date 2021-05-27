<style type="text/css">
  .not_found {
    cursor: pointer;
    transition: 0.5s;
  }
  /* Fix bug where top left cell isn't bordered on the left */
  .table-bordered > :not(caption) > * {
    border-width: 1px 1px;
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
    cursor: default;
    transition: 0.5s;
  }
  .immediate_duplicate {
    /* pale orange */
    background-color: #ffa756 !important;
    color: black;
    cursor: default;
    transition: 0.5s;
  }
  .duplicate {
    /* wheat */
    background-color: #fbdd7e !important;
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
  import { boardStore, victoryStore } from './stores/boardStore';
  import { checkBoard } from './rules';
  import { DEFAULT_FREE_SPACE, DEFAULT_BINGO_LETTERS, DEFAULT_WIN_CONDITION } from './defaults';
  import type { Board, Row, Cell } from './types';

  // TODO: Move defaults elsewhere
  export let freeSpace = DEFAULT_FREE_SPACE;
  export let bingoLetters = DEFAULT_BINGO_LETTERS;
  export let winCondition = DEFAULT_WIN_CONDITION;

  function getCellClass(cell: Cell): string {
    let cssClass = null;
    if (cell.state.active) {
      cssClass = 'active';
    } else if (cell.state.immediateDuplicate) {
      cssClass = 'immediate_duplicate';
    } else if (cell.state.duplicate) {
      cssClass = 'duplicate';
    } else if (cell.state.win) {
      cssClass = 'win';
    } else if (cell.state.found) {
      cssClass = 'found';
    } else {
      cssClass = 'not_found';
    }

    if (cell.title == freeSpace) {
      cssClass += ' free-space';
    }

    return cssClass;
  }

  function highlightImmediateDuplicates(selectedCell): void {
    if (selectedCell.state.duplicate) {
      let duplicates = [];
      $boardStore.forEach((row) =>
        row.forEach(
          (cell) =>
            selectedCell.value.trim().toLowerCase() === cell.value.trim().toLowerCase() &&
            duplicates.push(cell)
        )
      );
      // First, mark as duplicates
      duplicates.forEach((cell) => {
        cell.state.immediateDuplicate = true;
      });
      // Then unmark after a bit
      window.setTimeout(() => {
        duplicates.forEach((cell) => {
          cell.state.immediateDuplicate = false;
        }),
          3000;
      });
    }
  }

  function handleSelectCell(selectedCell, col, row): void {
    // Ignore clicks on the free space
    if (selectedCell.title === freeSpace) {
      return;
    }
    // highlightImmediateDuplicates(selectedCell);

    document.getElementById(`${col}x${row}`).focus();
  }

  function handleSelectInput(ri, ci): void {
    $boardStore[ri][ci].state.active = true;
    highlightImmediateDuplicates($boardStore[ri][ci]);
  }

  function handleLeaveInput(event: FocusEvent, row: number, col: number): void {
    // If there is text in the input, set "found" to true
    const nowFound = Boolean((<HTMLInputElement>event.target).value);
    if (nowFound !== $boardStore[row][col].state.found) {
      $boardStore[row][col].state.found = nowFound;
    }
    $boardStore[row][col].state.active = false;
    $victoryStore = checkBoard($boardStore, winCondition);
  }

</script>

<table class="table table-bordered">
  <thead>
    <th></th>
    {#each bingoLetters as letter}
      <th class="text-center">{letter}</th>
    {/each}
  </thead>
  <tbody>
    {#each $boardStore as row, ri}
      <tr>
        <th class="align-middle">{ri + 1}</th>
        {#each row as cell, ci}
          <td
            class="bingo-cell align-middle {getCellClass(cell)}"
            on:click="{() => handleSelectCell(cell, ri, ci)}"
          >
            {#if false}
              <code>{JSON.stringify(cell)}</code>
            {/if}
            <span class="bingo-cell-text">
              {cell.title}
            </span>
            <br />
            {#if cell.title !== freeSpace}
              <input
                on:focus="{() => handleSelectInput(ri, ci)}"
                on:blur="{(event) => handleLeaveInput(event, ri, ci)}"
                bind:value="{$boardStore[ri][ci].value}"
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
