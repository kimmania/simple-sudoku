export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Cell {
  value: number;
  given: boolean;
  notes: Set<number>;
}

export interface Grid {
  cells: Cell[][];
}

export interface Puzzle {
  id: string;
  difficulty: Difficulty;
  puzzle: string;
  solution: string;
}

export type GameStatus = 'playing' | 'won';

export interface GameState {
  grid: Grid;
  solution: number[][];
  puzzleString: string;
  difficulty: Difficulty;
  puzzleId: string;
  selected: { row: number; col: number } | null;
  noteMode: boolean;
  mistakes: number;
  status: GameStatus;
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export const CLUE_RANGES: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 40, max: 45 },
  medium: { min: 32, max: 36 },
  hard: { min: 28, max: 31 },
  expert: { min: 22, max: 27 },
};

export const RECENT_PUZZLE_COUNT = 20;

export const STORAGE_KEY = 'simple-sudoku-save';
