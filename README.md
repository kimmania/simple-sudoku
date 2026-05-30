# Simple Sudoku

A mobile-first Sudoku game built with vanilla TypeScript. Play in the browser — optimized for iPad Mini — with pencil notes, auto-fill candidates, mistake counting, and four difficulty levels.

## Features

- **Difficulty levels:** Easy, Medium, Hard, Expert
- **Notes mode:** Tap pencil marks for candidate digits
- **Fill Notes:** Auto-fill candidates only on empty cells with no notes yet
- **Mistake counter:** Tracks wrong entries against the solution
- **Resume game:** Progress saved to local storage
- **750+ puzzles:** Pre-generated banks with session anti-repeat

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
2. After deploy: `https://<username>.github.io/simple-sudoku/`

## License

MIT
