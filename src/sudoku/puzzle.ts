import type { Difficulty, GameState, Puzzle } from './types';
import { RECENT_PUZZLE_COUNT } from './types';
import { cloneGrid, parsePuzzleString, parseSolutionString } from './grid';
import { getCompletedIds } from './progress';

const recentKey = (difficulty: Difficulty) => `simple-sudoku-recent-${difficulty}`;

export async function loadPuzzles(difficulty: Difficulty): Promise<Puzzle[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}puzzles/${difficulty}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load puzzles for ${difficulty}`);
  }

  const puzzles = (await response.json()) as Puzzle[];
  return puzzles;
}

function getRecentIds(difficulty: Difficulty): string[] {
  try {
    const raw = sessionStorage.getItem(recentKey(difficulty));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function recordRecentId(difficulty: Difficulty, id: string): void {
  const recent = getRecentIds(difficulty).filter((existing) => existing !== id);
  recent.unshift(id);
  sessionStorage.setItem(
    recentKey(difficulty),
    JSON.stringify(recent.slice(0, RECENT_PUZZLE_COUNT)),
  );
}

export function pickRandomPuzzle(puzzles: Puzzle[], difficulty: Difficulty): Puzzle {
  if (puzzles.length === 0) {
    throw new Error(`No puzzles available for ${difficulty}`);
  }

  // Prefer puzzles the player hasn't completed yet; fall back to the full set
  // once everything has been solved.
  const completed = new Set(getCompletedIds(difficulty));
  const unsolved = puzzles.filter((puzzle) => !completed.has(puzzle.id));
  const candidates = unsolved.length > 0 ? unsolved : puzzles;

  const recent = new Set(getRecentIds(difficulty));
  let pool = candidates.filter((puzzle) => !recent.has(puzzle.id));
  if (pool.length === 0) {
    pool = candidates;
  }

  const index = Math.floor(Math.random() * pool.length);
  const puzzle = pool[index];
  recordRecentId(difficulty, puzzle.id);
  return puzzle;
}

export async function loadPuzzleById(difficulty: Difficulty, id: string): Promise<Puzzle> {
  const puzzles = await loadPuzzles(difficulty);
  const puzzle = puzzles.find((candidate) => candidate.id === id);
  if (!puzzle) {
    throw new Error(`Puzzle ${id} not found for ${difficulty}`);
  }
  return puzzle;
}

export function createGameState(puzzle: Puzzle): GameState {
  return {
    grid: parsePuzzleString(puzzle.puzzle),
    solution: parseSolutionString(puzzle.solution),
    puzzleString: puzzle.puzzle,
    difficulty: puzzle.difficulty,
    puzzleId: puzzle.id,
    selected: null,
    noteMode: false,
    mistakes: 0,
    status: 'playing',
  };
}

export function resetGameState(state: GameState): void {
  state.grid = parsePuzzleString(state.puzzleString);
  state.mistakes = 0;
  state.status = 'playing';
  state.selected = null;
}

export async function startNewGame(difficulty: Difficulty): Promise<GameState> {
  const puzzles = await loadPuzzles(difficulty);
  const puzzle = pickRandomPuzzle(puzzles, difficulty);
  return createGameState(puzzle);
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    grid: cloneGrid(state.grid),
    solution: state.solution.map((row) => [...row]),
    selected: state.selected ? { ...state.selected } : null,
  };
}
