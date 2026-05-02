# Changelog

All notable changes to the Planner Schedule App are recorded here.
Format: `[YYYY-MM-DD] — Description`

---

## [2026-05-02] — Fixed header navbar (sticky to top)

### Changed
- `App.jsx` — header changed from `position: sticky` to `position: fixed` with `top: 0; left: 0; right: 0; z-index: 100`
- `App.jsx` — scrollable content wrapper given `paddingTop: 110` so content is not hidden behind the fixed header
- `App.jsx` — removed `overflowY: 'auto'` from root div (was blocking sticky behaviour)
- Header now stays pinned across all views: Daily, Weekly, and Admin

---

## [2026-05-02] — Event status field (Open / Closed)

### Added
- `Event` interface — new `status` field: `'open' | 'closed'`, defaults to `'open'` on new events
- `EventForm.jsx` — Status row with **Open** (green outline) / **Closed** (red outline) toggle pills, shown above Notes
- `EventCard.jsx` — when `status === 'closed'`:
  - Title rendered with `text-decoration: line-through` and dimmed to `--txt3`
  - Card opacity reduced to 55%
  - Red **"Closed"** badge shown next to the time pill

---

## [2026-05-01] — Initial web app launch

### Added
- React 18 + Vite 5 project scaffolded on port 6003
- IndexedDB (`planner-db` v2) with `events` and `categories` stores via `idb`
- Daily view, Weekly view (drag-and-drop), Admin view
- EventForm modal — title, date, start/end time, label colour picker (16 swatches + custom hex), category selector, notes
- EventCard — colour left border, time pill, category badge, edit/delete actions
- DragDropDialog — Move / Copy with conflict resolution and time adjustment
- AdminView — Overview stats, Category Management (CRUD), Export backup, Import/Restore, Danger Zone
- Light / Dark theme toggle with flash-prevention inline script
- Print / Export via `window.print()` with colour-preserving print CSS
- Material Symbols Outlined icons via Google Fonts CDN
- Pure CSS animations: `popIn`, `fadeUp`, `slideR`, `slideL`, `modalIn`
- Full-width layout, no max-width cap; weekly grid with horizontal scroll at narrow widths
