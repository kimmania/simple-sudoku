import type { GameState } from '../sudoku/types';
import {
  getConflictCells,
  getDigitHighlightCells,
  getRelatedCells,
  getWrongCells,
} from '../sudoku/validate';

type BoardElements = {
  container: HTMLElement;
  cells: HTMLElement[][];
  noteSpans: HTMLElement[][][];
};

export function createBoard(container: HTMLElement): BoardElements {
  container.innerHTML = '';
  const cells: HTMLElement[][] = [];
  const noteSpans: HTMLElement[][][] = [];

  for (let row = 0; row < 9; row++) {
    cells[row] = [];
    noteSpans[row] = [];
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.tabIndex = -1;

      const valueEl = document.createElement('span');
      valueEl.className = 'cell-value';
      cell.appendChild(valueEl);

      const notesEl = document.createElement('div');
      notesEl.className = 'cell-notes';
      const spans: HTMLElement[] = [];
      for (let digit = 1; digit <= 9; digit++) {
        const span = document.createElement('span');
        span.className = 'note';
        span.dataset.digit = String(digit);
        span.textContent = String(digit);
        notesEl.appendChild(span);
        spans.push(span);
      }
      cell.appendChild(notesEl);
      noteSpans[row][col] = spans;

      container.appendChild(cell);
      cells[row][col] = cell;
    }
  }

  return { container, cells, noteSpans };
}

export function renderBoard(
  board: BoardElements,
  state: GameState,
  highlightDigit: number | null,
): void {
  const conflicts = getConflictCells(state.grid);
  const wrong = getWrongCells(state.grid, state.solution);
  const related = state.selected
    ? getRelatedCells(state.selected.row, state.selected.col)
    : new Set<string>();
  const digitCells =
    highlightDigit !== null ? getDigitHighlightCells(state.grid, highlightDigit) : new Set<string>();

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const key = `${row},${col}`;
      const cellData = state.grid.cells[row][col];
      const cellEl = board.cells[row][col];
      const valueEl = cellEl.querySelector('.cell-value') as HTMLElement;

      cellEl.classList.toggle('given', cellData.given);
      cellEl.classList.toggle('selected', state.selected?.row === row && state.selected?.col === col);
      cellEl.classList.toggle('related', related.has(key) && !(state.selected?.row === row && state.selected?.col === col));
      cellEl.classList.toggle('conflict', conflicts.has(key));
      cellEl.classList.toggle('wrong', wrong.has(key));
      cellEl.classList.toggle('digit-highlight', digitCells.has(key));
      cellEl.classList.toggle('box-right', col === 2 || col === 5);
      cellEl.classList.toggle('box-bottom', row === 2 || row === 5);

      if (cellData.value !== 0) {
        valueEl.textContent = String(cellData.value);
        valueEl.hidden = false;
        cellEl.classList.add('filled');
      } else {
        valueEl.textContent = '';
        valueEl.hidden = true;
        cellEl.classList.remove('filled');
      }

      for (let digit = 1; digit <= 9; digit++) {
        const noteEl = board.noteSpans[row][col][digit - 1];
        noteEl.hidden = !cellData.notes.has(digit);
      }
    }
  }
}

export function bindBoardClick(
  board: BoardElements,
  onSelect: (row: number, col: number) => void,
): void {
  board.container.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest('.cell') as HTMLElement | null;
    if (!target) return;
    const row = parseInt(target.dataset.row ?? '', 10);
    const col = parseInt(target.dataset.col ?? '', 10);
    if (Number.isNaN(row) || Number.isNaN(col)) return;
    onSelect(row, col);
  });
}
