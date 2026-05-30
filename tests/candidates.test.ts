import { describe, expect, it } from 'vitest';
import { commitValue, fillEmptyNotes, toggleNote } from '../src/sudoku/candidates';
import { createEmptyGrid, parsePuzzleString } from '../src/sudoku/grid';
import { pickRandomPuzzle } from '../src/sudoku/puzzle';
import type { Difficulty, Puzzle } from '../src/sudoku/types';
import { RECENT_PUZZLE_COUNT } from '../src/sudoku/types';
import { getConflictCells, isSolved, stripNotesInPeers } from '../src/sudoku/validate';
import { getCandidates } from '../src/sudoku/candidates';

const SAMPLE_PUZZLE =
  '530070000600195000098000060000267000000000000419000000000000080000002000000000000';
const SAMPLE_SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

function makeSampleGrid() {
  return parsePuzzleString(SAMPLE_PUZZLE);
}

function makeSampleSolution() {
  const grid = parsePuzzleString(SAMPLE_SOLUTION);
  return grid.cells.map((row) => row.map((cell) => cell.value));
}

describe('getCandidates', () => {
  it('returns valid candidates for an empty cell', () => {
    const grid = makeSampleGrid();
    const candidates = getCandidates(grid, 0, 2);
    expect(candidates.has(5)).toBe(false);
    expect(candidates.has(4)).toBe(true);
  });
});

describe('fillEmptyNotes', () => {
  it('fills only empty cells with no existing notes', () => {
    const grid = makeSampleGrid();
    grid.cells[0][2].notes.add(9);

    const filled = fillEmptyNotes(grid);
    expect(filled).toBeGreaterThan(0);
    expect(grid.cells[0][2].notes.has(9)).toBe(true);
    expect(grid.cells[0][2].notes.size).toBe(1);
  });
});

describe('commitValue', () => {
  it('counts a mistake for wrong digits', () => {
    const grid = makeSampleGrid();
    const solution = makeSampleSolution();
    const mistakes = commitValue(grid, 0, 2, 1, solution);
    expect(mistakes).toBe(1);
  });

  it('does not count a mistake for correct digits', () => {
    const grid = makeSampleGrid();
    const solution = makeSampleSolution();
    const mistakes = commitValue(grid, 0, 2, 4, solution);
    expect(mistakes).toBe(0);
    expect(grid.cells[0][2].value).toBe(4);
  });
});

describe('stripNotesInPeers', () => {
  it('removes digit from peer notes after commit', () => {
    const grid = makeSampleGrid();
    grid.cells[0][3].notes.add(4);
    stripNotesInPeers(grid, 0, 2, 4);
    expect(grid.cells[0][3].notes.has(4)).toBe(false);
  });
});

describe('toggleNote', () => {
  it('adds and removes notes', () => {
    const grid = makeSampleGrid();
    toggleNote(grid, 0, 2, 5);
    expect(grid.cells[0][2].notes.has(5)).toBe(true);
    toggleNote(grid, 0, 2, 5);
    expect(grid.cells[0][2].notes.has(5)).toBe(false);
  });
});

describe('pickRandomPuzzle', () => {
  it('excludes recently played puzzle ids', () => {
    const difficulty: Difficulty = 'easy';
    const key = `simple-sudoku-recent-${difficulty}`;
    sessionStorage.setItem(key, JSON.stringify(['easy-001']));

    const puzzles: Puzzle[] = [
      { id: 'easy-001', difficulty, puzzle: '1', solution: '1' },
      { id: 'easy-002', difficulty, puzzle: '2', solution: '2' },
    ];

    const picked = pickRandomPuzzle(puzzles, difficulty);
    expect(picked.id).toBe('easy-002');

    sessionStorage.removeItem(key);
  });
});

describe('validation', () => {
  it('detects conflicts', () => {
    const grid = createEmptyGrid();
    grid.cells[0][0].value = 5;
    grid.cells[0][1].value = 5;
    expect(getConflictCells(grid).size).toBeGreaterThan(0);
  });

  it('detects solved grid', () => {
    const grid = parsePuzzleString(SAMPLE_SOLUTION);
    const solution = makeSampleSolution();
    expect(isSolved(grid, solution)).toBe(true);
  });
});

describe('constants', () => {
  it('tracks recent puzzle window', () => {
    expect(RECENT_PUZZLE_COUNT).toBe(20);
  });
});
