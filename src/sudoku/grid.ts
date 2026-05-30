import type { Cell, Grid } from './types';

export function createEmptyGrid(): Grid {
  const cells: Cell[][] = [];
  for (let row = 0; row < 9; row++) {
    cells[row] = [];
    for (let col = 0; col < 9; col++) {
      cells[row][col] = { value: 0, given: false, notes: new Set() };
    }
  }
  return { cells };
}

export function cloneGrid(grid: Grid): Grid {
  const cells: Cell[][] = [];
  for (let row = 0; row < 9; row++) {
    cells[row] = [];
    for (let col = 0; col < 9; col++) {
      const cell = grid.cells[row][col];
      cells[row][col] = {
        value: cell.value,
        given: cell.given,
        notes: new Set(cell.notes),
      };
    }
  }
  return { cells };
}

export function parsePuzzleString(puzzle: string): Grid {
  const grid = createEmptyGrid();
  const normalized = puzzle.replace(/\./g, '0');
  if (normalized.length !== 81) {
    throw new Error(`Puzzle string must be 81 characters, got ${normalized.length}`);
  }

  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const digit = parseInt(normalized[i], 10);
    if (Number.isNaN(digit) || digit < 0 || digit > 9) {
      throw new Error(`Invalid digit at position ${i}: ${normalized[i]}`);
    }
    grid.cells[row][col].value = digit;
    grid.cells[row][col].given = digit !== 0;
  }

  return grid;
}

export function parseSolutionString(solution: string): number[][] {
  const normalized = solution.replace(/\./g, '0');
  if (normalized.length !== 81) {
    throw new Error(`Solution string must be 81 characters, got ${normalized.length}`);
  }

  const result: number[][] = [];
  for (let row = 0; row < 9; row++) {
    result[row] = [];
    for (let col = 0; col < 9; col++) {
      const digit = parseInt(normalized[row * 9 + col], 10);
      if (Number.isNaN(digit) || digit < 1 || digit > 9) {
        throw new Error(`Invalid solution digit at ${row},${col}`);
      }
      result[row][col] = digit;
    }
  }
  return result;
}

export function getBoxStart(row: number, col: number): { row: number; col: number } {
  return { row: Math.floor(row / 3) * 3, col: Math.floor(col / 3) * 3 };
}

export function forEachPeer(
  row: number,
  col: number,
  callback: (peerRow: number, peerCol: number) => void,
): void {
  for (let c = 0; c < 9; c++) {
    if (c !== col) callback(row, c);
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row) callback(r, col);
  }
  const { row: boxRow, col: boxCol } = getBoxStart(row, col);
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row || c !== col) callback(r, c);
    }
  }
}

export function clearNotesOnEmptyCells(grid: Grid): void {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = grid.cells[row][col];
      if (cell.value === 0) {
        cell.notes.clear();
      }
    }
  }
}
