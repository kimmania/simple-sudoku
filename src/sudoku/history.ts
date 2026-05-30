import type { GameState } from './types';
import { cloneGrid } from './grid';

export interface HistorySnapshot {
  grid: ReturnType<typeof cloneGrid>;
  mistakes: number;
  status: GameState['status'];
}

export function captureSnapshot(state: GameState): HistorySnapshot {
  return {
    grid: cloneGrid(state.grid),
    mistakes: state.mistakes,
    status: state.status,
  };
}

export function applySnapshot(state: GameState, snapshot: HistorySnapshot): void {
  state.grid = cloneGrid(snapshot.grid);
  state.mistakes = snapshot.mistakes;
  state.status = snapshot.status;
}
