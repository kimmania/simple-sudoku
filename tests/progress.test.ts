import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCompletedCount,
  getCompletedIds,
  getTriedIds,
  isCompleted,
  recordCompleted,
  recordTried,
  TRIED_CAP,
} from '../src/sudoku/progress';
import { pickRandomPuzzle } from '../src/sudoku/puzzle';
import type { Puzzle } from '../src/sudoku/types';

function makePuzzle(id: string): Puzzle {
  return {
    id,
    difficulty: 'easy',
    puzzle: '530070000600195000098000060000267000000000000419000000000000080000002000000000000',
    solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
  };
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('progress tracking', () => {
  it('records tried puzzles most-recent first', () => {
    recordTried('easy', 'a');
    recordTried('easy', 'b');
    expect(getTriedIds('easy')).toEqual(['b', 'a']);
  });

  it('re-trying a puzzle moves it to the front without duplicating', () => {
    recordTried('easy', 'a');
    recordTried('easy', 'b');
    recordTried('easy', 'a');
    expect(getTriedIds('easy')).toEqual(['a', 'b']);
  });

  it('caps the tried list at TRIED_CAP', () => {
    for (let i = 0; i < TRIED_CAP + 20; i++) {
      recordTried('easy', `p${i}`);
    }
    const tried = getTriedIds('easy');
    expect(tried).toHaveLength(TRIED_CAP);
    expect(tried[0]).toBe(`p${TRIED_CAP + 19}`);
  });

  it('tracks difficulties independently', () => {
    recordTried('easy', 'a');
    recordTried('hard', 'b');
    expect(getTriedIds('easy')).toEqual(['a']);
    expect(getTriedIds('hard')).toEqual(['b']);
  });

  it('recordCompleted moves the puzzle out of tried and reports first-time', () => {
    recordTried('easy', 'a');
    recordTried('easy', 'b');
    expect(recordCompleted('easy', 'a')).toBe(true);
    expect(getTriedIds('easy')).toEqual(['b']);
    expect(getCompletedIds('easy')).toEqual(['a']);
    expect(isCompleted('easy', 'a')).toBe(true);
    expect(getCompletedCount('easy')).toBe(1);
  });

  it('recordCompleted is idempotent and reports repeat solves', () => {
    expect(recordCompleted('easy', 'a')).toBe(true);
    expect(recordCompleted('easy', 'a')).toBe(false);
    expect(getCompletedCount('easy')).toBe(1);
  });

  it('recordTried ignores already-completed puzzles', () => {
    recordCompleted('easy', 'a');
    recordTried('easy', 'a');
    expect(getTriedIds('easy')).toEqual([]);
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('simple-sudoku-progress', '{not json');
    expect(getTriedIds('easy')).toEqual([]);
    expect(getCompletedCount('easy')).toBe(0);
  });
});

describe('pickRandomPuzzle prefers uncompleted', () => {
  const puzzles = [makePuzzle('a'), makePuzzle('b'), makePuzzle('c')];

  it('never picks a completed puzzle while uncompleted ones remain', () => {
    recordCompleted('easy', 'a');
    recordCompleted('easy', 'b');
    for (let i = 0; i < 20; i++) {
      expect(pickRandomPuzzle(puzzles, 'easy').id).toBe('c');
    }
  });

  it('falls back to the full pool when everything is completed', () => {
    recordCompleted('easy', 'a');
    recordCompleted('easy', 'b');
    recordCompleted('easy', 'c');
    const picked = pickRandomPuzzle(puzzles, 'easy');
    expect(['a', 'b', 'c']).toContain(picked.id);
  });
});
