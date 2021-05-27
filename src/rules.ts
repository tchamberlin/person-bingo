import { DEFAULT_WIN_CONDITION } from './defaults';
import type { Board, Row, Cell } from './types';

function cellIsValid(cell) {
  return cell.state.found && !cell.state.duplicate;
}

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

export function checkBoard(board: Board, winCondition: string): boolean {
  console.debug('checkBoard', board, winCondition);
  const allValues = [];
  board.forEach((row: Row) =>
    row.forEach((cell: Cell) => {
      if (cell.value.trim() !== '') {
        allValues.push(cell.value.trim());
      }
    })
  );

  // Check duplicates first
  board.forEach((row: Row, ri: number) =>
    row.forEach((cell: Cell, ci: number) => {
      board[ri][ci].state.duplicate =
        allValues.filter((value) => value.trim().toLowerCase() === cell.value.trim().toLowerCase())
          .length > 1;
    })
  );

  const rule = RULES[winCondition] || RULES[DEFAULT_WIN_CONDITION];
  const wonCells = rule.function(board);

  board.forEach((row: Row, ri: number) =>
    row.forEach((_, ci: number) => {
      board[ri][ci].state.win = wonCells.indexOf(`${ri}x${ci}`) !== -1;
    })
  );

  return Boolean(wonCells.length);
}
