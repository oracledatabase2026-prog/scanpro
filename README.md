# ScanPro — Barcode Intelligence Dashboard

A production-ready, premium SaaS-style barcode & QR extraction dashboard. Every scan runs
entirely client-side — no file ever leaves the browser.

## Features

- **Upload scanning** — drag & drop JPG/PNG/WEBP/JFIF images or multi-page PDFs; each PDF page
  is rasterized and decoded independently.
- **Live camera scanning** — continuous barcode detection from a device camera.
- **Multi-format decoding** — QR Code, EAN-13/8, UPC-A/E, Code 128/39, ITF, Data Matrix,
  PDF-417, Aztec, Codabar.
- **Enhancement pipeline** — optional auto-contrast, deskew, and multi-attempt (rotated retry)
  decoding for difficult scans.
- **Dashboard** — live stat cards, scan progress with logs, filterable/searchable results table
  with pagination and expandable rows, and Chart.js visualizations (format distribution,
  per-file counts, confidence trend).
- **Invoice linking** — upload a product/invoice spreadsheet (.xlsx/.csv), map its columns, and
  match rows against decoded barcode values. Export results back to Excel.
- **Export** — results to CSV or XLSX at any time.
- **Dark mode**, collapsible sidebar, toast notifications, responsive layout, keyboard-focus
  states, and reduced-motion support.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Chart.js (react-chartjs-2) ·
Lucide React · Zustand · TanStack Query · React Hook Form + Zod (wired for future forms) ·
@zxing/library (barcode decoding) · pdfjs-dist (PDF rasterization) · xlsx + file-saver
(spreadsheet import/export).

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build      # type-check and produce a production build in /dist
npm run preview    # preview the production build locally
npm run lint       # run oxlint
```

## Deployment

The app builds to a static `dist/` folder and can be deployed directly to **Vercel**,
**Netlify**, or **GitHub Pages**.

For GitHub Pages, set `base` in `vite.config.ts` to your repository name (e.g.
`base: '/your-repo-name/'`) before building, since GitHub Pages serves from a subpath.

## Project structure

```
src/
  components/
    layout/      Header, Sidebar, Footer
    ui/          Button, Card/Badge primitives, Toaster, PageSkeleton
    dashboard/   Hero, StatCard, StatisticsGrid
    scanner/     ScannerPanel (upload + settings + controls), LiveProgress
    results/     ResultsTable
    charts/      ChartsSection (Chart.js)
    camera/      CameraScanner (live video decoding)
    invoice/     InvoiceLinker (spreadsheet column mapping + matching)
  hooks/         useDropzone, useScanner
  pages/         DashboardPage, ScansPage, CameraPage, ReportsPage, HistoryPage,
                 SettingsPage, HelpPage
  services/      barcodeService (ZXing + pdf.js decoding pipeline)
  store/         useAppStore (Zustand global state)
  types/         shared TypeScript types
  utils/         format.ts, exportHelpers.ts
```

## Notes on architecture

- Raw `File` objects are kept out of the Zustand store (in a plain `Map` inside
  `hooks/useScanner.ts`) so store state stays lightweight and serializable.
- Heavy dependencies (`chart.js`, `@zxing/library`, `pdfjs-dist`, `xlsx`) are split into
  separate vendor chunks and several pages are lazy-loaded, so the initial bundle stays small.
- Color palette, radii, shadows, and animation timings are defined once as CSS custom
  properties in `src/index.css` (Tailwind v4 `@theme`), so dark mode just overrides the
  token values rather than duplicating styles.
