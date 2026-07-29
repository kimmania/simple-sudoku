import type { Difficulty } from './types';

const PROGRESS_KEY = 'simple-sudoku-progress';
export const TRIED_CAP = 100;

interface Progress {
  completed: string[];
  tried: string[];
}

type ProgressStore = Partial<Record<Difficulty, Progress>>;

function readStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — ignore.
  }
}

function getProgress(store: ProgressStore, difficulty: Difficulty): Progress {
  const existing = store[difficulty];
  return {
    completed: Array.isArray(existing?.completed) ? existing.completed : [],
    tried: Array.isArray(existing?.tried) ? existing.tried : [],
  };
}

export function getCompletedIds(difficulty: Difficulty): string[] {
  return getProgress(readStore(), difficulty).completed;
}

export function isCompleted(difficulty: Difficulty, id: string): boolean {
  return getCompletedIds(difficulty).includes(id);
}

/** Most-recent first, capped at TRIED_CAP, excluding completed puzzles. */
export function getTriedIds(difficulty: Difficulty): string[] {
  const { tried, completed } = getProgress(readStore(), difficulty);
  const done = new Set(completed);
  return tried.filter((id) => !done.has(id));
}

export function getCompletedCount(difficulty: Difficulty): number {
  return getCompletedIds(difficulty).length;
}

/** Record that a puzzle was started. Moves it to the front of the tried list. */
export function recordTried(difficulty: Difficulty, id: string): void {
  const store = readStore();
  const progress = getProgress(store, difficulty);
  if (progress.completed.includes(id)) {
    return; // Already solved — no need to track as tried.
  }
  const tried = [id, ...progress.tried.filter((existing) => existing !== id)];
  progress.tried = tried.slice(0, TRIED_CAP);
  store[difficulty] = progress;
  writeStore(store);
}

/** Record a win: add to completed, remove from tried. Returns true if this was a first-time solve. */
export function recordCompleted(difficulty: Difficulty, id: string): boolean {
  const store = readStore();
  const progress = getProgress(store, difficulty);
  progress.tried = progress.tried.filter((existing) => existing !== id);
  const firstTime = !progress.completed.includes(id);
  if (firstTime) {
    progress.completed.push(id);
  }
  store[difficulty] = progress;
  writeStore(store);
  return firstTime;
}
