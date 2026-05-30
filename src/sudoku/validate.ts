import type { Grid } from './types';
import { forEachPeer } from './grid';

export function hasConflict(grid: Grid, row: number, col: number): boolean {
  const value = grid.cells[row][col].value;
  if (value === 0) return false;

  for (let c = 0; c < 9; c++) {
    if (c !== col && grid.cells[row][c].value === value) return true;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid.cells[r][col].value === value) return true;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid.cells[r][c].value === value) {
        return true;
      }
    }
  }

  return false;
}

export function getConflictCells(grid: Grid): Set<string> {
  const conflicts = new Set<string>();

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = grid.cells[row][col].value;
      if (value === 0) continue;

      for (let c = 0; c < 9; c++) {
        if (c !== col && grid.cells[row][c].value === value) {
          conflicts.add(`${row},${col}`);
          conflicts.add(`${row},${c}`);
        }
      }
      for (let r = 0; r < 9; r++) {
        if (r !== row && grid.cells[r][col].value === value) {
          conflicts.add(`${row},${col}`);
          conflicts.add(`${r},${col}`);
        }
      }

      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if ((r !== row || c !== col) && grid.cells[r][c].value === value) {
            conflicts.add(`${row},${col}`);
            conflicts.add(`${r},${c}`);
          }
        }
      }
    }
  }

  return conflicts;
}

export function isComplete(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid.cells[row][col].value === 0) return false;
    }
  }
  return true;
}

export function isSolved(grid: Grid, solution: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid.cells[row][col].value !== solution[row][col]) return false;
    }
  }
  return true;
}

export function isWrongValue(
  grid: Grid,
  row: number,
  col: number,
  solution: number[][],
): boolean {
  const cell = grid.cells[row][col];
  if (cell.given || cell.value === 0) return false;
  return cell.value !== solution[row][col];
}

export function getWrongCells(grid: Grid, solution: number[][]): Set<string> {
  const wrong = new Set<string>();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (isWrongValue(grid, row, col, solution)) {
        wrong.add(`${row},${col}`);
      }
    }
  }
  return wrong;
}

export function getDigitHighlightCells(grid: Grid, digit: number): Set<string> {
  const cells = new Set<string>();
  if (digit === 0) return cells;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = grid.cells[row][col];
      if (cell.value === digit || cell.notes.has(digit)) {
        cells.add(`${row},${col}`);
      }
    }
  }
  return cells;
}

export function getRelatedCells(row: number, col: number): Set<string> {
  const related = new Set<string>();
  related.add(`${row},${col}`);

  for (let c = 0; c < 9; c++) related.add(`${row},${c}`);
  for (let r = 0; r < 9; r++) related.add(`${r},${col}`);

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      related.add(`${r},${c}`);
    }
  }

  return related;
}

export function stripNotesInPeers(grid: Grid, row: number, col: number, digit: number): void {
  forEachPeer(row, col, (peerRow, peerCol) => {
    grid.cells[peerRow][peerCol].notes.delete(digit);
  });
}
