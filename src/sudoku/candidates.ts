import type { Grid } from './types';
import { forEachPeer } from './grid';
import { stripNotesInPeers } from './validate';

export function getCandidates(grid: Grid, row: number, col: number): Set<number> {
  const cell = grid.cells[row][col];
  if (cell.value !== 0) return new Set();

  const used = new Set<number>();
  forEachPeer(row, col, (peerRow, peerCol) => {
    const peerValue = grid.cells[peerRow][peerCol].value;
    if (peerValue !== 0) used.add(peerValue);
  });

  const candidates = new Set<number>();
  for (let digit = 1; digit <= 9; digit++) {
    if (!used.has(digit)) candidates.add(digit);
  }
  return candidates;
}

/** Fill notes only on empty cells that have no notes yet. */
export function fillEmptyNotes(grid: Grid): number {
  let filled = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = grid.cells[row][col];
      if (cell.value !== 0 || cell.notes.size > 0) continue;
      cell.notes = getCandidates(grid, row, col);
      filled++;
    }
  }
  return filled;
}

export function toggleNote(grid: Grid, row: number, col: number, digit: number): void {
  const cell = grid.cells[row][col];
  if (cell.value !== 0 || cell.given) return;

  if (cell.notes.has(digit)) {
    cell.notes.delete(digit);
  } else {
    cell.notes.add(digit);
  }
}

export function commitValue(
  grid: Grid,
  row: number,
  col: number,
  digit: number,
  solution: number[][],
): number {
  const cell = grid.cells[row][col];
  if (cell.given) return 0;

  const wasWrong = cell.value !== 0 && cell.value !== solution[row][col];
  const isWrong = digit !== solution[row][col];
  const mistakeDelta = (isWrong ? 1 : 0) - (wasWrong ? 1 : 0);

  cell.value = digit;
  cell.notes.clear();
  stripNotesInPeers(grid, row, col, digit);

  return mistakeDelta;
}

export function eraseCell(grid: Grid, row: number, col: number): void {
  const cell = grid.cells[row][col];
  if (cell.given) return;
  cell.value = 0;
}
