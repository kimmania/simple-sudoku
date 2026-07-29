import type { Difficulty } from '../sudoku/types';
import { getTriedIds } from '../sudoku/progress';

export function getDifficultySelect(): HTMLSelectElement {
  return document.getElementById('difficulty') as HTMLSelectElement;
}

export function getSelectedDifficulty(): Difficulty {
  return getDifficultySelect().value as Difficulty;
}

export function setDifficulty(difficulty: Difficulty): void {
  getDifficultySelect().value = difficulty;
}

export function updateMistakes(count: number): void {
  const el = document.getElementById('mistakes');
  if (el) el.textContent = `Mistakes: ${count}`;
}

export function updatePuzzleId(id: string): void {
  const label = id ? `#${id}` : '';
  document.getElementById('puzzle-id')?.replaceChildren(document.createTextNode(label));
  document.getElementById('puzzle-id-footer')?.replaceChildren(document.createTextNode(label));
}

export function setNoteMode(active: boolean): void {
  const btn = document.getElementById('note-mode');
  if (!btn) return;
  btn.classList.toggle('active', active);
  btn.setAttribute('aria-pressed', String(active));
}

export function setUndoEnabled(enabled: boolean): void {
  const btn = document.getElementById('undo') as HTMLButtonElement | null;
  if (!btn) return;
  btn.disabled = !enabled;
}

export function showWinBanner(show: boolean, firstTime = true): void {
  const banner = document.getElementById('win-banner');
  if (!banner) return;
  banner.classList.toggle('hidden', !show);
  if (show) {
    const label = banner.querySelector('.win-message');
    if (label) {
      label.textContent = firstTime
        ? 'Puzzle complete — first time solving this one!'
        : 'Puzzle complete! You had solved this one before.';
    }
  }
}

export function updateProgress(completed: number, total: number): void {
  const el = document.getElementById('progress-count');
  if (el) el.textContent = `${completed.toLocaleString()} / ${total.toLocaleString()} solved`;
}

export function setPreviousEnabled(enabled: boolean): void {
  const btn = document.getElementById('previous') as HTMLButtonElement | null;
  if (!btn) return;
  btn.disabled = !enabled;
}

export function closePreviousPicker(): void {
  document.getElementById('previous-picker')?.classList.add('hidden');
}

export function togglePreviousPicker(difficulty: Difficulty, onPick: (id: string) => void): void {
  const picker = document.getElementById('previous-picker');
  if (!picker) return;
  if (!picker.classList.contains('hidden')) {
    closePreviousPicker();
    return;
  }

  const list = picker.querySelector('.picker-list');
  if (!list) return;
  list.replaceChildren();

  const ids = getTriedIds(difficulty);
  if (ids.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'picker-empty';
    empty.textContent = 'No unsolved puzzles to revisit yet.';
    list.appendChild(empty);
  } else {
    for (const id of ids) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'picker-item';
      item.textContent = `#${id}`;
      item.addEventListener('click', () => {
        closePreviousPicker();
        onPick(id);
      });
      list.appendChild(item);
    }
  }

  picker.classList.remove('hidden');
}

export function bindControlHandlers(handlers: {
  onNewGame: () => void;
  onReset: () => void;
  onNoteMode: () => void;
  onFillNotes: () => void;
  onClearNotes: () => void;
  onUndo: () => void;
  onDifficultyChange: () => void;
  onPrevious: () => void;
}): void {
  document.getElementById('new-game')?.addEventListener('click', handlers.onNewGame);
  document.getElementById('reset')?.addEventListener('click', handlers.onReset);
  document.getElementById('note-mode')?.addEventListener('click', handlers.onNoteMode);
  document.getElementById('fill-notes')?.addEventListener('click', handlers.onFillNotes);
  document.getElementById('clear-notes')?.addEventListener('click', handlers.onClearNotes);
  document.getElementById('undo')?.addEventListener('click', handlers.onUndo);
  document.getElementById('previous')?.addEventListener('click', handlers.onPrevious);
  getDifficultySelect().addEventListener('change', handlers.onDifficultyChange);

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('#previous-picker') && !target.closest('#previous')) {
      closePreviousPicker();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePreviousPicker();
  });
}

export function bindNumpadHandlers(handlers: {
  onDigit: (digit: number) => void;
  onErase: () => void;
}): void {
  const numpad = document.getElementById('numpad');
  numpad?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.id === 'erase') {
      handlers.onErase();
      return;
    }
    const digit = parseInt(target.dataset.digit ?? '', 10);
    if (!Number.isNaN(digit)) handlers.onDigit(digit);
  });
}

export function setActiveDigit(digit: number | null): void {
  document.querySelectorAll('.numpad-btn[data-digit]').forEach((btn) => {
    const el = btn as HTMLElement;
    const value = parseInt(el.dataset.digit ?? '', 10);
    el.classList.toggle('active', digit !== null && value === digit);
  });
}
