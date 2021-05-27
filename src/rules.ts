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

function cellIsValid(cell) {
  return cell.state.found && !cell.state.duplicate;
}

export const RULES = {
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

function checkRowWin(board: Board): Array<string> {
  let wonCells = [];
  board.forEach((row: Array<Cell>, ri: number) => {
    if (row.every((cell: Cell) => cellIsValid(cell))) {
      row.forEach((_, ci: number) => wonCells.push(`${ri}x${ci}`));
    }
  });
  return wonCells;
}

function checkColWin(board: Board): Array<string> {
  let wonCells = [];
  // TODO: will break with non-square boards
  [...Array(board.length).keys()].forEach((ci: number) => {
    if (board.every((row: Array<Cell>) => cellIsValid(row[ci]))) {
      board.forEach((_, ri: number) => wonCells.push(`${ri}x${ci}`));
    }
  });
  return wonCells;
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

function checkLineWin(board: Board) {
  const wonCells = [...checkRowWin(board), ...checkDiagonalWin(board), ...checkColWin(board)];
  return wonCells;
}

function checkFourCornersWin(board: Board): Array<string> {
  return cellIsValid(board[0][0]) &&
    cellIsValid(board[0][4]) &&
    cellIsValid(board[4][0]) &&
    cellIsValid(board[4][4])
    ? ['0x0', '0x4', '4x0', '4x4']
    : [];
}

function checkWholeBoardWin(board: Board): Array<string> {
  let win = true;
  board.forEach((row: Array<Cell>) =>
    row.forEach((cell: Cell) => {
      if (!cellIsValid(cell)) {
        win = false;
      }
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

export function checkBoard(board: Board, winCondition: string): boolean {
  console.debug('checkBoard', board, winCondition);
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
        allValues.filter((value) => value.trim().toLowerCase() === cell.value.trim().toLowerCase())
          .length > 1;
    })
  );

  const wonCells = RULES[winCondition].function(board);

  board.forEach((row: Array<Cell>, ri: number) =>
    row.forEach((_, ci: number) => {
      board[ri][ci].state.win = wonCells.indexOf(`${ri}x${ci}`) !== -1;
    })
  );

  return Boolean(wonCells.length);
}
