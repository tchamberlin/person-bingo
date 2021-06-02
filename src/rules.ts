import { DEFAULT_WIN_CONDITION } from './defaults';
import type { Board, Row, Cell } from './types';

function cellIsValid(cell) {
  return cell.state.found;
}

const genSimpleRule = (name, shape) => ({
  name: name,
  blurb: `complete the given "${name.toLowerCase()}" shape exactly`,
  function: (board: Board) => checkSimple(board, shape),
  examples: [() => shape],
});

const benchShape = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0],
];

const anchorShape = [
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [0, 1, 1, 1, 0],
];

const bullseyeShape = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
];

const heartShape = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];

export const RULES = {
  line: {
    name: 'Standard',
    blurb: 'complete a horizontal, vertical, OR diagonal line',
    function: checkLineWin,
    examples: [exampleRowWin, exampleColWin, exampleDiagonalWin],
  },
  'four-corners': {
    name: 'Four Corners',
    blurb: 'complete all four corners of the board',
    function: checkFourCornersWin,
    examples: [exampleFourCornersWin],
  },
  'whole-board': {
    name: 'Whole Board',
    blurb: 'complete EVERY square on the board',
    function: checkWholeBoardWin,
    examples: [exampleWholeBoardWin],
  },
  bench: genSimpleRule('Bench', benchShape),
  anchor: genSimpleRule('Anchor', anchorShape),
  bullseye: genSimpleRule('Bullseye', bullseyeShape),
  heart: genSimpleRule('Heart', heartShape),
};

function checkRowWin(board: Board): Array<string> {
  let wonCells = [];
  board.forEach((row: Row, ri: number) => {
    if (row.every((cell: Cell) => cellIsValid(cell))) {
      row.forEach((_, ci: number) => wonCells.push(`${ri}x${ci}`));
    }
  });
  return wonCells;
}

function exampleRowWin(): Array<Array<boolean>> {
  let example = [];
  for (let ri = 0; ri < 5; ri++) {
    let row = [];
    for (let ci = 0; ci < 5; ci++) {
      row.push(ri === 0);
    }
    example.push(row);
  }
  return example;
}

function checkColWin(board: Board): Array<string> {
  let wonCells = [];
  // TODO: will break with non-square boards
  [...Array(board.length).keys()].forEach((ci: number) => {
    if (board.every((row: Row) => cellIsValid(row[ci]))) {
      board.forEach((_, ri: number) => wonCells.push(`${ri}x${ci}`));
    }
  });
  return wonCells;
}

function exampleColWin(): Array<Array<boolean>> {
  let example = [];
  for (let ri = 0; ri < 5; ri++) {
    let row = [];
    for (let ci = 0; ci < 5; ci++) {
      row.push(ci === 0);
    }
    example.push(row);
  }
  return example;
}

function checkDiagonalWin(board: Board): Array<string> {
  let wonCells = [];
  const ix = [...Array(board.length).keys()];
  if (ix.every((i: number) => cellIsValid(board[i][i]))) {
    ix.forEach((i: number) => wonCells.push(`${i}x${i}`));
  }
  if (ix.every((i: number) => cellIsValid(board[board.length - 1 - i][i]))) {
    ix.forEach((i: number) => wonCells.push(`${board.length - 1 - i}x${i}`));
  }
  return wonCells;
}

function exampleDiagonalWin(): Array<Array<boolean>> {
  let example = [];
  for (let ri = 0; ri < 5; ri++) {
    let row = [];
    for (let ci = 0; ci < 5; ci++) {
      row.push(ci === ri);
    }
    example.push(row);
  }
  return example;
}

function checkLineWin(board: Board) {
  const wonCells = [...checkRowWin(board), ...checkDiagonalWin(board), ...checkColWin(board)];
  return wonCells;
}

function checkFourCornersWin(board: Board): Array<string> {
  const topLeft = [0, 0];
  const topRight = [0, board[0].length - 1];
  const bottomLeft = [board[board.length - 1].length - 1, 0];
  const bottomRight = [board[board.length - 1].length - 1, board[board.length - 1].length - 1];
  return cellIsValid(board[topLeft[0]][topLeft[1]]) &&
    cellIsValid(board[topRight[0]][topRight[1]]) &&
    cellIsValid(board[bottomLeft[0]][bottomLeft[1]]) &&
    cellIsValid(board[bottomRight[0]][bottomRight[1]])
    ? [topLeft.join('x'), topRight.join('x'), bottomLeft.join('x'), bottomRight.join('x')]
    : [];
}

function exampleFourCornersWin(): Array<Array<boolean>> {
  let example = [];
  for (let ri = 0; ri < 5; ri++) {
    let row = [];
    for (let ci = 0; ci < 5; ci++) {
      row.push(
        (ri == 0 && ci == 0) || (ri == 0 && ci == 4) || (ri == 4 && ci == 0) || (ri == 4 && ci == 4)
      );
    }
    example.push(row);
  }
  return example;
}

function checkWholeBoardWin(board: Board): Array<string> {
  let win = true;
  board.forEach((row: Row) =>
    row.forEach((cell: Cell) => {
      if (!cellIsValid(cell)) {
        win = false;
      }
    })
  );

  let wonCells = [];
  if (win) {
    board.forEach((row: Row, ri: number) =>
      row.forEach((_, ci: number) => {
        wonCells.push(`${ri}x${ci}`);
      })
    );
  }
  return wonCells;
}

function exampleWholeBoardWin(): Array<Array<boolean>> {
  let example = [];
  for (let ri = 0; ri < 5; ri++) {
    let row = [];
    for (let ci = 0; ci < 5; ci++) {
      row.push(true);
    }
    example.push(row);
  }
  return example;
}

function checkSimple(board: Board, shape: Array<Array<number>>): Array<string> {
  let wonCells = [];
  let won = true;
  board.forEach((row: Row, ri: number) =>
    row.forEach((cell: Cell, ci: number) => {
      if (shape[ri][ci]) {
        if (cellIsValid(board[ri][ci])) {
          wonCells.push(`${ri}x${ci}`);
        } else {
          // If ANY aren't found that should have been, we don't have ANY won cells
          won = false;
        }
      }
    })
  );
  if (won) {
    return wonCells;
  } else {
    return [];
  }
}

function checkDuplicates(board: Board, allValues: Array<string>, maxDuplicates = 1) {
  if (!maxDuplicates || maxDuplicates < 1) {
    maxDuplicates = 1;
  }
  board.forEach((row: Row, ri: number) =>
    row.forEach((cell: Cell, ci: number) => {
      const duplicates = allValues.filter(
        (value) => value.trim().toLowerCase() === cell.value.trim().toLowerCase()
      );
      board[ri][ci].state.duplicate = duplicates.length > maxDuplicates;
    })
  );
}

export function checkBoard(board: Board, winCondition: string, maxDuplicates: number): boolean {
  const allValues = [];
  board.forEach((row: Row) =>
    row.forEach((cell: Cell) => {
      if (cell.value.trim() !== '') {
        allValues.push(cell.value.trim());
      }
    })
  );

  // Check duplicates for ALL cells first
  checkDuplicates(board, allValues, maxDuplicates);

  const rule = RULES[winCondition] || RULES[DEFAULT_WIN_CONDITION];
  // The rule.function will give us cell indices, e.g. 0x0, so we map these to cells
  const wonCellsIndices = rule.function(board);
  const wonCells = wonCellsIndices.map((indices) => {
    let [ri, ci] = indices.split('x');
    return board[ri][ci];
  });

  // We have POTENTIALLY won if there are any won cells
  let haveWon = Boolean(wonCells.length);
  // Now walk through the board and check every won cell for duplicates. But ONLY duplicates
  // within the won cells! These are the only ones that will stop a win
  board.forEach((row: Row, ri: number) =>
    row.forEach((cell: Cell, ci: number) => {
      if (wonCellsIndices.indexOf(`${ri}x${ci}`) !== -1) {
        const duplicates = wonCells.filter(
          ({ value }) => value.trim().toLowerCase() === cell.value.trim().toLowerCase()
        );
        if (duplicates.length > maxDuplicates) {
          haveWon = false;
        }
      }
    })
  );

  // Finally, if we've still won after considering duplicates, mark each won cell
  if (haveWon) {
    board.forEach((row: Row, ri: number) =>
      row.forEach((cell: Cell, ci: number) => {
        // If the current cell is "won"
        if (wonCellsIndices.indexOf(`${ri}x${ci}`) !== -1) {
          board[ri][ci].state.win = true;
        }
      })
    );
    // ...or mark everything lost
  } else {
    board.forEach((row: Row, ri: number) =>
      row.forEach((cell: Cell, ci: number) => {
        board[ri][ci].state.win = false;
      })
    );
  }

  return haveWon;
}
