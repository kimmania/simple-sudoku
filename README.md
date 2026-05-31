# Simple Sudoku

A mobile-first Sudoku game built with vanilla TypeScript. Play in the browser — optimized for iPad Mini — with pencil notes, auto-fill candidates, mistake counting, and four difficulty levels.

**Play online:** [https://kimmania.github.io/simple-sudoku/](https://kimmania.github.io/simple-sudoku/)

## Features

- **Difficulty levels:** Easy, Medium, Hard, Expert
- **Notes mode:** Tap pencil marks for candidate digits
- **Fill Notes:** Auto-fill candidates only on empty cells with no notes yet
- **Undo:** Revert the last digit, note, or bulk note change
- **Reset:** Clear your entries and start the current puzzle over
- **Undo:** Revert the last digit, note, or bulk note change
- **Mistake counter:** Tracks wrong entries against the solution
- **Resume game:** Progress saved to local storage
- **40,000 puzzles:** 10,000 per difficulty, with session anti-repeat
- **Installable PWA:** Add to Home Screen on iPad or iPhone for a full-screen app experience

## Development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173/simple-sudoku/`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run generate-puzzles` | Regenerate puzzle JSON banks |

## GitHub Pages

Pushes to `main` deploy automatically via GitHub Actions.

1. Enable **GitHub Pages** → Source: **GitHub Actions**
2. Live site: [https://kimmania.github.io/simple-sudoku/](https://kimmania.github.io/simple-sudoku/)

## Install on iPad

1. Open the site in Safari
2. Tap the Share button
3. Choose **Add to Home Screen**

## License

MIT
