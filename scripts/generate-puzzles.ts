import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface Puzzle {
  id: string;
  difficulty: Difficulty;
  puzzle: string;
  solution: string;
}

const TARGETS: Record<Difficulty, number> = {
  easy: 10_000,
  medium: 10_000,
  hard: 10_000,
  expert: 10_000,
};

const PUZZLES_PER_SOLUTION = 20;

const CLUE_RANGES: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 40, max: 45 },
  medium: { min: 32, max: 36 },
  hard: { min: 28, max: 31 },
  expert: { min: 22, max: 27 },
};

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function gridToString(grid: number[][]): string {
  return grid.flat().join('');
}

function copyGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

function isValidPlacement(grid: number[][], row: number, col: number, digit: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === digit) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === digit) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === digit) return false;
    }
  }
  return true;
}

function countSolutions(grid: number[][], limit = 2): number {
  const working = copyGrid(grid);
  let count = 0;

  function solve(): void {
    if (count >= limit) return;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (working[row][col] !== 0) continue;

        for (let digit = 1; digit <= 9; digit++) {
          if (!isValidPlacement(working, row, col, digit)) continue;
          working[row][col] = digit;
          solve();
          working[row][col] = 0;
          if (count >= limit) return;
        }
        return;
      }
    }

    count++;
  }

  solve();
  return count;
}

function generateCompleteGrid(): number[][] {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

  function fill(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== 0) continue;
        const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const digit of digits) {
          if (!isValidPlacement(grid, row, col, digit)) continue;
          grid[row][col] = digit;
          if (fill()) return true;
          grid[row][col] = 0;
        }
        return false;
      }
    }
    return true;
  }

  fill();
  return grid;
}

function countClues(grid: number[][]): number {
  return grid.flat().filter((value) => value !== 0).length;
}

function makePuzzle(solution: number[][], difficulty: Difficulty): number[][] | null {
  const puzzle = copyGrid(solution);
  const cells = shuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 })),
  );
  const range = CLUE_RANGES[difficulty];
  const target = range.min + Math.floor(Math.random() * (range.max - range.min + 1));

  for (const { row, col } of cells) {
    if (countClues(puzzle) <= target) break;

    const backup = puzzle[row][col];
    if (backup === 0) continue;

    puzzle[row][col] = 0;
    if (countSolutions(puzzle) !== 1) {
      puzzle[row][col] = backup;
    }
  }

  const clues = countClues(puzzle);
  if (clues < range.min || clues > range.max) return null;
  if (countSolutions(puzzle) !== 1) return null;
  return puzzle;
}

function generateForDifficulty(difficulty: Difficulty): Puzzle[] {
  const puzzles: Puzzle[] = [];
  const seen = new Set<string>();
  const target = TARGETS[difficulty];
  let attempts = 0;
  const maxAttempts = target * 20;
  const idWidth = String(target).length;

  while (puzzles.length < target && attempts < maxAttempts) {
    attempts++;
    const solution = generateCompleteGrid();
    const solutionStr = gridToString(solution);

    for (let i = 0; i < PUZZLES_PER_SOLUTION && puzzles.length < target; i++) {
      const puzzleGrid = makePuzzle(solution, difficulty);
      if (!puzzleGrid) continue;

      const puzzleStr = gridToString(puzzleGrid);
      if (seen.has(puzzleStr)) continue;
      seen.add(puzzleStr);

      puzzles.push({
        id: `${difficulty}-${String(puzzles.length + 1).padStart(idWidth, '0')}`,
        difficulty,
        puzzle: puzzleStr,
        solution: solutionStr,
      });

      if (puzzles.length % 500 === 0) {
        console.log(`  ${difficulty}: ${puzzles.length}/${target}`);
      }
    }
  }

  if (puzzles.length < target) {
    console.warn(`  ${difficulty}: only generated ${puzzles.length}/${target}`);
  }

  return puzzles;
}

const outDir = join(process.cwd(), 'public', 'puzzles');
mkdirSync(outDir, { recursive: true });

for (const difficulty of ['easy', 'medium', 'hard', 'expert'] as Difficulty[]) {
  console.log(`Generating ${difficulty}...`);
  const started = Date.now();
  const puzzles = generateForDifficulty(difficulty);
  const path = join(outDir, `${difficulty}.json`);
  writeFileSync(path, JSON.stringify(puzzles));
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`Wrote ${path} (${puzzles.length} puzzles, ${seconds}s)`);
}

console.log('Done.');
