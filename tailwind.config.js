/** @type {import('tailwindcss').Config} */

// ── Barinhall Design Tokens ────────────────────────────────────────────────────
// Single source of truth for the Barinhall Delivery Hub design system.
//
// Brand colors  : indigo-* (primary actions, links, brand marks)
// Neutrals      : slate-* (backgrounds, text, borders — cooler/crisper than gray)
// Status colors : green (Active) · amber (On Hold) · sky (Completed) · slate (Draft)
// Surfaces      : white cards on slate-50 page background
//
// Typography    : Inter (loaded in index.html via Google Fonts)
//   Display/h1  : Inter 700–800,  2xl–3xl, tight tracking
//   Body        : Inter 400–500,  sm–base, normal tracking
//   Labels/UI   : Inter 500–600,  xs–sm, uppercase for section labels
//
// Shadows       : shadow-card (resting) · shadow-card-hover · shadow-modal
// ─────────────────────────────────────────────────────────────────────────────

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Replace Tailwind's default sans stack with Inter
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // shadow-card / shadow-card-hover / shadow-modal are defined in
      // src/index.css @layer utilities (not here) so @apply can resolve them.
    },
  },
  plugins: [],
};
