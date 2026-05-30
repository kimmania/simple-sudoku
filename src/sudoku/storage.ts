import type { GameState } from './types';
import { STORAGE_KEY } from './types';
import { parsePuzzleString, parseSolutionString } from './grid';

interface SavedGame {
  puzzleId: string;
  difficulty: GameState['difficulty'];
  puzzle: string;
  solution: string;
  values: number[][];
  notes: number[][][];
  selected: { row: number; col: number } | null;
  noteMode: boolean;
  mistakes: number;
  status: GameState['status'];
}

export function saveGame(state: GameState): void {
  let puzzleStr = '';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = state.grid.cells[row][col];
      puzzleStr += cell.given ? String(cell.value) : '0';
    }
  }

  const saved: SavedGame = {
    puzzleId: state.puzzleId,
    difficulty: state.difficulty,
    puzzle: puzzleStr,
    solution: state.solution.flat().join(''),
    values: state.grid.cells.map((row) => row.map((cell) => cell.value)),
    notes: state.grid.cells.map((row) =>
      row.map((cell) => Array.from(cell.notes).sort((a, b) => a - b)),
    ),
    selected: state.selected,
    noteMode: state.noteMode,
    mistakes: state.mistakes,
    status: state.status,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage full or unavailable — ignore.
  }
}

export function loadSavedGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw) as SavedGame;
    const grid = parsePuzzleString(saved.puzzle);

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = grid.cells[row][col];
        if (!cell.given) {
          cell.value = saved.values[row][col];
          cell.notes = new Set(saved.notes[row][col]);
        }
      }
    }

    return {
      grid,
      solution: parseSolutionString(saved.solution),
      difficulty: saved.difficulty,
      puzzleId: saved.puzzleId,
      selected: saved.selected,
      noteMode: saved.noteMode,
      mistakes: saved.mistakes,
      status: saved.status,
    };
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
