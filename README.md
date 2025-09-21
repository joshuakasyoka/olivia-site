# Olivia Hingley — Index (React + Vite)

A simple site with:
- Horizontal image gallery (thumbnails).
- Vertical index list below (date, title, index number).
- Hover index badge above thumbnails.
- Two filters: **Writing** (articles) and **Speaking** (talks).
- Home and About pages (React Router).

## Quick start

```bash
npm install
npm run dev
```

Then open the URL from the terminal (usually <http://localhost:5173/>).

## Customising

- Update `src/data/items.js` with your real content. Each item uses:
  ```js
  { id: 1, type: 'article' | 'talk', date: 'dd.mm.yyyy', title: '...', image: '/src/assets/your-image.ext' }
  ```
- Replace the SVG placeholders under `src/assets/` with your images (JPG/PNG/SVG).
- Styles live in `src/styles.css` — tweak spacing, fonts, and colours there.

## Build for production

```bash
npm run build
npm run preview
```
