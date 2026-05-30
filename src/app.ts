import type { GameState } from './sudoku/types';
import { clearNotesOnEmptyCells } from './sudoku/grid';
import { applySnapshot, captureSnapshot, type HistorySnapshot } from './sudoku/history';
import {
  commitValue,
  eraseCell,
  fillEmptyNotes,
  toggleNote,
} from './sudoku/candidates';
import { startNewGame } from './sudoku/puzzle';
import { clearSavedGame, loadSavedGame, saveGame } from './sudoku/storage';
import { isSolved } from './sudoku/validate';
import { bindBoardClick, createBoard, renderBoard } from './ui/board';
import {
  bindControlHandlers,
  bindNumpadHandlers,
  getSelectedDifficulty,
  setActiveDigit,
  setDifficulty,
  setNoteMode,
  setUndoEnabled,
  showWinBanner,
  updateMistakes,
  updatePuzzleId,
} from './ui/controls';

export class SudokuApp {
  private state: GameState | null = null;
  private board = createBoard(document.getElementById('board')!);
  private activeDigit: number | null = null;
  private loading = false;
  private undoStack: HistorySnapshot[] = [];

  async init(): Promise<void> {
    bindBoardClick(this.board, (row, col) => this.selectCell(row, col));
    bindControlHandlers({
      onNewGame: () => void this.newGame(),
      onNoteMode: () => this.toggleNoteMode(),
      onFillNotes: () => this.handleFillNotes(),
      onClearNotes: () => this.handleClearNotes(),
      onUndo: () => this.handleUndo(),
      onDifficultyChange: () => void this.newGame(),
    });
    bindNumpadHandlers({
      onDigit: (digit) => this.handleDigit(digit),
      onErase: () => this.handleErase(),
    });

    document.addEventListener('keydown', (event) => this.handleKeydown(event));

    const saved = loadSavedGame();
    if (saved && saved.status === 'playing') {
      this.state = saved;
      setDifficulty(saved.difficulty);
      this.clearUndo();
      this.refresh();
      return;
    }

    await this.newGame();
  }

  private async newGame(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    clearSavedGame();
    this.clearUndo();

    try {
      const difficulty = getSelectedDifficulty();
      this.state = await startNewGame(difficulty);
      this.activeDigit = null;
      this.refresh();
    } catch (error) {
      console.error(error);
      alert('Could not load a puzzle. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  private clearUndo(): void {
    this.undoStack = [];
    setUndoEnabled(false);
  }

  private recordUndoPoint(): void {
    if (!this.state || this.state.status === 'won') return;
    this.undoStack = [captureSnapshot(this.state)];
  }

  private selectCell(row: number, col: number): void {
    if (!this.state || this.state.status === 'won') return;
    this.state.selected = { row, col };
    const value = this.state.grid.cells[row][col].value;
    this.activeDigit = value !== 0 ? value : this.activeDigit;
    this.refresh();
  }

  private toggleNoteMode(): void {
    if (!this.state || this.state.status === 'won') return;
    this.state.noteMode = !this.state.noteMode;
    setNoteMode(this.state.noteMode);
    saveGame(this.state);
  }

  private handleFillNotes(): void {
    if (!this.state || this.state.status === 'won') return;
    this.recordUndoPoint();
    fillEmptyNotes(this.state.grid);
    this.refresh();
  }

  private handleClearNotes(): void {
    if (!this.state || this.state.status === 'won') return;
    this.recordUndoPoint();
    clearNotesOnEmptyCells(this.state.grid);
    this.refresh();
  }

  private handleUndo(): void {
    if (!this.state || this.undoStack.length === 0) return;
    const snapshot = this.undoStack.pop()!;
    applySnapshot(this.state, snapshot);
    this.refresh();
  }

  private handleDigit(digit: number): void {
    if (!this.state || this.state.status === 'won') return;

    this.activeDigit = digit;
    const selected = this.state.selected;
    if (!selected) {
      this.refresh();
      return;
    }

    const { row, col } = selected;
    const cell = this.state.grid.cells[row][col];
    if (cell.given) return;

    this.recordUndoPoint();

    if (this.state.noteMode) {
      toggleNote(this.state.grid, row, col, digit);
    } else {
      const mistakeDelta = commitValue(this.state.grid, row, col, digit, this.state.solution);
      this.state.mistakes += mistakeDelta;
      if (isSolved(this.state.grid, this.state.solution)) {
        this.state.status = 'won';
      }
    }

    this.refresh();
  }

  private handleErase(): void {
    if (!this.state || this.state.status === 'won') return;
    const selected = this.state.selected;
    if (!selected) return;

    const { row, col } = selected;
    const cell = this.state.grid.cells[row][col];
    if (cell.given) return;

    this.recordUndoPoint();

    if (this.state.noteMode && cell.value === 0 && this.activeDigit !== null) {
      cell.notes.delete(this.activeDigit);
    } else {
      eraseCell(this.state.grid, row, col);
    }

    this.refresh();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.state || this.state.status === 'won') return;

    const target = event.target as HTMLElement;
    if (target.tagName === 'SELECT') return;

    if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
      event.preventDefault();
      this.handleUndo();
      return;
    }

    if (event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      this.handleDigit(parseInt(event.key, 10));
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      this.handleErase();
      return;
    }

    if (event.key === 'n' || event.key === 'N') {
      this.toggleNoteMode();
      return;
    }

    const selected = this.state.selected;
    if (!selected) return;

    let { row, col } = selected;
    switch (event.key) {
      case 'ArrowUp':
        row = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        row = Math.min(8, row + 1);
        break;
      case 'ArrowLeft':
        col = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        col = Math.min(8, col + 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    this.selectCell(row, col);
  }

  private refresh(): void {
    if (!this.state) return;

    renderBoard(this.board, this.state, this.activeDigit);
    updateMistakes(this.state.mistakes);
    updatePuzzleId(this.state.puzzleId);
    setNoteMode(this.state.noteMode);
    setActiveDigit(this.activeDigit);
    setUndoEnabled(this.undoStack.length > 0);
    showWinBanner(this.state.status === 'won');

    if (this.state.status === 'playing') {
      saveGame(this.state);
    } else {
      clearSavedGame();
    }
  }
}

export async function bootstrap(): Promise<void> {
  const app = new SudokuApp();
  await app.init();
}
