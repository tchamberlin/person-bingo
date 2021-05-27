export interface Cell {
  title: string;
  value: string;
  state: {
    found: boolean;
    active: boolean;
    win: boolean;
    duplicate: boolean;
    immediateDuplicate: boolean;
  };
}
export type Row = Array<Cell>;
export type Board = Array<Row>;

export type Coord = [number, number];
