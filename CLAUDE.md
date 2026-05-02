# CLAUDE.md — Planner Schedule App

This file gives Claude full context to understand, modify, and extend this project correctly.

---

## Project Overview

A full React web app (Vite build) schedule planner built with:
- **React 18** (npm package, proper ES modules)
- **Vite 5** (build tool + dev server on port **6003**)
- **idb** (IndexedDB promise wrapper — events + categories storage)
- **Material Symbols Outlined** (Google icon font, loaded via CDN in `index.html`)
- **Pure CSS animations** (no Framer Motion)
- **Google Fonts**: removed — all fonts are now **Tahoma, Geneva, sans-serif**

Run with `npm run dev` → `http://localhost:6003`
Build with `npm run build` → outputs to `dist/`

---

## Project Structure

```
├── index.html              — HTML shell (flash-prevention script + Material Symbols font link)
├── vite.config.js          — Vite config (port 6003)
├── package.json
├── src/
│   ├── main.jsx            — ReactDOM.createRoot entry point
│   ├── App.jsx             — Root component, all app state
│   ├── index.css           — All CSS (themes, animations, component classes)
│   ├── db.js               — IndexedDB helpers (events + categories stores)
│   ├── utils.js            — Date helpers, theme helpers, DAYS/MONTHS arrays
│   ├── constants.js        — COLOR_PALETTE, DEFAULT_COLOR, eventColor(), legacy CATS
│   └── components/
│       ├── Icon.jsx            — Thin wrapper around Material Symbols Outlined
│       ├── ThemeToggle.jsx
│       ├── EventForm.jsx
│       ├── ConfirmDialog.jsx
│       ├── EventCard.jsx
│       ├── DailyView.jsx
│       ├── WeeklyView.jsx
│       ├── AdminView.jsx       — Import/export backup + Category Management
│       └── DragDropDialog.jsx  — Move/Copy dialog with conflict resolution
```

---

## Architecture

### Build
- **Vite + @vitejs/plugin-react** handles JSX transpilation and bundling
- No Babel standalone, no CDN UMD scripts
- All imports use standard ES module syntax (`import`/`export`)

### Icons
- **Material Symbols Outlined** loaded from Google Fonts CDN in `index.html`
- Shared `<Icon name="..." size={18} />` component in `src/components/Icon.jsx`
- No emojis or unicode symbols anywhere in the UI
- Font variation: `wght 300, FILL 0` (outlined, light weight)

### Styling
All CSS in `src/index.css` using CSS custom properties. No Tailwind. No inline color hardcodes except the amber logo "P" contrast text. Full width layout — no `maxWidth` cap on the main container.

### State
All state managed locally in `App.jsx` — no global store or context.

---

## Light / Dark Theme System

Controlled by `data-theme` attribute on `<html>`. Defaults to `dark`.

### Dark mode tokens
```css
--bg: #0d1117  --bg-card: #161b27  --bg-raised: #1e2536  --border: #2a3450
--txt: #e8ecf4  --txt2: #8892b0  --txt3: #4a5578  --amber: #f0a500
```

### Light mode tokens (cool slate palette — not warm/beige)
```css
--bg: #eef2f7  --bg-card: #ffffff  --bg-raised: #e2e8f0  --border: #cbd5e1
--txt: #0f172a  --txt2: #475569  --txt3: #94a3b8  --amber: #d97706
```

### Theme persistence
- `loadTheme()` / `saveTheme()` in `utils.js` use **localStorage** (`planner_theme`)
- Must stay in localStorage (synchronous) — used by the flash-prevention inline script in `index.html`
- Flash prevention: inline `<script>` in `<head>` applies saved theme before first paint

### Category colors by theme

| Category (legacy) | Dark       | Light      |
|-------------------|------------|------------|
| Work              | `#4ade80`  | `#16a34a`  |
| Meeting           | `#60a5fa`  | `#2563eb`  |
| Study             | `#c084fc`  | `#7c3aed`  |
| Personal          | `#fb923c`  | `#ea580c`  |

Personal color in light mode: `#dc2626` (red, not orange)

---

## Component Tree

```
App
├── Header (inline JSX) — position: fixed, top: 0, full width, z-index: 100
│   ├── Logo "P" (amber bg, theme-aware text color)
│   ├── "Today" badge (shown when date = today)
│   ├── View tabs (Daily / Weekly / Admin)  ← Admin tab has settings icon
│   ├── ThemeToggle (light_mode / dark_mode icon)
│   ├── Export button (print icon) → window.print()
│   ├── + Add Event button (add icon)
│   └── Date navigation (chevron_left / chevron_right / Today)
├── DailyView  → EventCard[]
├── WeeklyView → 7 columns → EventCard[]  (drag-and-drop enabled)
├── AdminView  → Overview / Category Management / Export / Import / Danger Zone
├── EventForm  (modal)
├── ConfirmDialog (modal)
└── DragDropDialog (modal)
```

---

## State (in `App.jsx`)

| State var       | Type                   | Purpose |
|-----------------|------------------------|---------|
| `events`        | `Event[]`              | All events, loaded from IndexedDB on mount |
| `categories`    | `Category[]`           | All categories, loaded from IndexedDB on mount |
| `categoriesMap` | `{[id]: name}`         | Memoized id→name lookup (useMemo) |
| `view`          | `'daily'│'weekly'│'admin'` | Current view |
| `date`          | `Date`                 | Currently selected/displayed date |
| `showForm`      | `bool`                 | EventForm modal open |
| `editing`       | `Event│null`           | Event being edited (null = new) |
| `delId`         | `string│null`          | ID pending delete confirm |
| `formDate`      | `Date│null`            | Pre-fills date in form when opened from a specific day |
| `viewKey`       | `number`               | Incremented on navigate/view-switch to re-trigger CSS entrance animations |
| `theme`         | `'dark'│'light'`       | Synced to `data-theme` attr and localStorage |
| `dragAction`    | `{ev, targetDate}│null`| Set when card is dropped on a new day — triggers DragDropDialog |

---

## Data Model & Storage

### IndexedDB — `planner-db` (version 2)

**`events` store** (keyPath: `id`)
```ts
interface Event {
  id: string;           // genId() — random base36 + timestamp
  title: string;        // required
  date: string;         // "YYYY-MM-DD"
  startTime: string;    // "HH:MM" 24-hour
  endTime: string;      // "HH:MM" 24-hour, must be > startTime
  color: string;        // hex e.g. "#3b82f6" — label colour
  categoryId: string;   // optional — references Category.id (empty string = none)
  notes: string;        // optional
  status: 'open' | 'closed'; // defaults to 'open'; 'closed' renders title crossed out
}
```

**`categories` store** (keyPath: `id`)
```ts
interface Category {
  id: string;   // genId()
  name: string; // unique, user-defined
}
```

### LocalStorage
| Key              | Value              | Purpose |
|------------------|--------------------|---------|
| `planner_theme`  | `'dark'│'light'`   | Theme preference (sync read needed for flash prevention) |

### DB helpers (`src/db.js`)
```js
getAllEvents()       // → Promise<Event[]>
putEvent(ev)        // upsert by id
removeEvent(id)     // delete

getAllCategories()   // → Promise<Category[]>
putCategory(cat)    // upsert by id
removeCategory(id)  // delete
```

### Date helpers (`src/utils.js`)
- `dKey(date)` → `"YYYY-MM-DD"`
- `sameDay(a, b)` → boolean
- `addDays(date, n)` → new Date
- `wkStart(date)` → Sunday of the week
- `fmt12(time24)` → `"9:00 AM"`
- `genId()` → unique ID
- `loadTheme()` / `saveTheme(t)` → localStorage

---

## Colour System (Label Colours on Events)

Events carry a `color` hex field (not category-based).

### Palette (`src/constants.js`)
16 preset swatches: Red, Orange, Yellow, Green, Emerald, Cyan, Blue, Indigo, Violet, Purple, Pink, Rose, Teal, Amber, Lime, Slate.

`DEFAULT_COLOR = '#3b82f6'` (Blue)

### `eventColor(ev)` helper
Returns `ev.color` if set, else falls back to legacy `CATS[ev.category].color`, else `DEFAULT_COLOR`. Handles old events that had `category` instead of `color`.

### EventCard display
- **Left border**: `3px solid ${color}`
- **Time pill**: background at 14% opacity, text + border in the colour, with a small filled dot
- **Category badge**: neutral pill (`--bg-raised` / `--txt2`) showing the category name — shown only if `ev.categoryId` is set and exists in `categoriesMap`
- **Status badge**: red "Closed" pill shown only when `ev.status === 'closed'`
- **Closed state**: title is struck through (`text-decoration: line-through`), text dimmed to `--txt3`, card opacity 55%

### Print
- `.event-color-pill` and `.event-card` both have `print-color-adjust: exact` — colours print faithfully
- Print CSS targets only text nodes with `color: black`, not the coloured pill spans
- In Weekly view, font sizes are scaled down and titles wrap so all 7 columns fit on one landscape page

---

## Category Management

### Admin → Category Management section
- **Create**: name input + Add button (Enter key supported); duplicate names blocked
- **Rename**: inline edit (✎ icon), Enter to save, Escape to cancel, duplicate names blocked
- **Delete**: two-step confirm (✕ icon); shows how many events use the category; deleting a category does NOT delete its events — `categoryId` just becomes stale
- **Usage count**: shown as a neutral badge next to each category name

### EventForm — Category selector
- Pill buttons (text only, no colour) below the colour picker
- "None" option to clear the selection
- Selected pill gets an amber outline
- If no categories exist → hint message pointing to Admin
- Stores `categoryId` on the event (empty string = no category)

---

## Validation Rules (EventForm & DragDropDialog)

1. **Title required**
2. **Date required**
3. **Start time must be before end time** (`startTime < endTime`)
4. **Status** — Open/Closed toggle pills; defaults to `'open'` on new events; no validation needed
5. **No time overlap** on the same date — checks all events on `f.date` where `e.id !== f.id` and `f.startTime < e.endTime && f.endTime > e.startTime`
   - Error message names the conflicting event and its time range

---

## Drag-and-Drop (Weekly View)

Only available in Weekly view. Uses HTML5 Drag and Drop API — no external library.

### Flow
1. Grab a card (`cursor: grab`, card fades to 35% opacity while dragging)
2. Hover over a different day column → amber dashed outline + "Drop here" hint
3. Drop on same day → no-op
4. Drop on different day → `DragDropDialog` opens

### DragDropDialog — Step 1 (Move or Copy)
- Shows event title, time, and target date
- **Move** (`drive_file_move` icon): removes from source date, places on target
- **Copy** (`content_copy` icon): original stays, new event (new ID) created on target

### DragDropDialog — Step 2 (Conflict resolution)
Triggered automatically if the dropped time range overlaps an event on the target date.
- Shows which event clashes and its time
- Inline Start/End time inputs to adjust
- Re-validates on every confirm attempt
- **Back** button returns to Step 1
- Conflict check for Move excludes the dragged event's own ID (it's leaving the source date)
- Conflict check for Copy checks all events (original stays)

---

## Animations

All pure CSS `@keyframes` — no JS animation library.

| Class         | Keyframe   | Used on |
|---------------|------------|---------|
| `.anim-pop`   | `popIn`    | EventCards |
| `.anim-up`    | `fadeUp`   | Header, errors, toast |
| `.anim-right` | `slideR`   | Daily view, Admin view |
| `.anim-left`  | `slideL`   | Weekly view |
| `.anim-modal` | `modalIn`  | All modals |

`viewKey` state is incremented on navigation/view-switch and passed as React `key` to force remount + re-animate.

---

## Weekly Grid Layout

- `.week-grid`: `display: grid; grid-template-columns: repeat(7, 1fr)` with `gap: 8px`
- Wrapped in `overflow-x: auto` container with `minWidth: 840px` on the grid — all 7 columns always visible, horizontal scroll on narrow screens
- `.week-col`: `min-width: 0; overflow: hidden` — prevents long text from blowing out column width

---

## Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.card` | Base card — bg-card, border, border-radius 12px |
| `.event-card` | Hover lift + box-shadow + `print-color-adjust: exact` |
| `.event-color-pill` | Time + colour dot pill on EventCard, `print-color-adjust: exact` |
| `.inp` | Form inputs — theme vars, amber focus ring |
| `.btn-primary` | Amber filled button (or custom color via inline style) |
| `.btn-ghost` | Transparent bordered button |
| `.btn-icon` | Small icon button, red on hover |
| `.btn-danger` | Red filled (combined with `.btn-primary`) |
| `.btn-theme` | Theme toggle — square, subtle scale on hover |
| `.view-tab` | Tab for Daily/Weekly/Admin switcher |
| `.view-tab.active` | Active tab state |
| `.overlay` | Full-screen modal backdrop, blur |
| `.week-grid` | 7-column CSS grid |
| `.week-col` | Day column, `min-width: 0` |
| `.week-col.is-today` | Amber-tinted today column |
| `.today-badge` | Amber pill badge in header |
| `.add-day-btn` | Dashed "+ Add" in weekly columns |
| `.no-print` | Hidden in `@media print` |
| `.print-header` | Shown only in print |
| `.glow` | Ambient radial decoration (fixed, pointer-events none) |
| `.material-symbols-outlined` | Icon font base — `wght 300, FILL 0`, `user-select: none` |

---

## Icon Usage

All icons use the `<Icon>` component from `src/components/Icon.jsx`:
```jsx
<Icon name="edit" size={16} style={{ color: 'red' }} />
```

Common icons used:

| Location | Icon name |
|---|---|
| Theme toggle dark→light | `light_mode` |
| Theme toggle light→dark | `dark_mode` |
| Nav prev/next | `chevron_left` / `chevron_right` |
| Export (print) | `print` |
| Add event | `add` |
| Admin tab | `settings` |
| Edit event | `edit` |
| Delete event | `delete` |
| Drag move | `drive_file_move` |
| Drag copy | `content_copy` |
| Drag back | `arrow_back` |
| Conflict warning | `warning` |
| Time field | `schedule` |
| Admin overview | `bar_chart` |
| Admin categories | `label` |
| Admin export | `download` |
| Admin import | `upload` |
| Admin folder pick | `folder_open` |
| Admin file preview | `description` |
| Admin merge mode | `merge` |
| Admin replace mode | `sync` |
| Admin delete all | `delete_forever` |
| Toast success | `check_circle` |
| Toast error | `error` |
| Weekly add button | `add` |
| Weekly drop hint | `file_download` |

---

## Admin View

Accessible via the **Admin** tab in the header view switcher. Date navigation is hidden when Admin is active.

### Sections
1. **Overview** — total events, total categories, earliest/latest event, colour breakdown dots
2. **Category Management** — full CRUD (see above)
3. **Export Backup** — downloads `planner-backup-YYYY-MM-DD.json` containing `{ exportedAt, version: 2, events, categories }`
4. **Import / Restore** — file picker for `.json` backups; Merge or Replace mode; preview panel before confirming
5. **Danger Zone** — two-step "Delete All Events" (categories untouched)

### Backup format (version 2)
```json
{
  "exportedAt": "2026-05-02T...",
  "version": 2,
  "events": [...],
  "categories": [...]
}
```
Import accepts both the wrapped format and bare arrays (for compatibility).

---

## Print / Export

Triggered by `window.print()` via the Export button.

`@page` rule: `size: A4 landscape; margin: 8mm` — forces landscape orientation for the weekly view.

`@media print` rules:
- `.no-print` → hidden (header, buttons, ThemeToggle)
- `.print-header` → shown (title + date range + rule)
- Body → white bg, black text (but NOT on `.event-color-pill` or `.event-card` — colours preserved)
- `.event-color-pill`, `.event-card` → `print-color-adjust: exact` so label colours and left borders print in colour
- Animations disabled via `animation: none !important`

### Weekly view single-page print
The outer scroll wrapper in `WeeklyView.jsx` has class `week-scroll`. Print CSS uses this to:
- Remove `overflow-x: auto` and `min-width: 840px` so the grid expands to full page width
- Scale fonts: week-head 8px, day-number 11px, event card text 9px, time pill 8px
- Allow event titles to wrap (`white-space: normal`) instead of truncating with ellipsis
- `break-inside: avoid` on `.week-col` and `.event-card` to prevent mid-card page breaks
- A typical week fits on one A4 landscape page; very event-heavy days may still overflow to a second page

---

## How to Extend

### Add a new icon
Use `<Icon name="material_symbol_name" size={N} />` — no imports needed beyond the component.

### Add a third theme (e.g., sepia)
1. Add `[data-theme="sepia"] { ... }` block in `src/index.css` with all the same variable names
2. Update `toggleTheme` in `App.jsx` to cycle three values
3. Update `ThemeToggle.jsx` to show the right icon for each state

### Add a new view (e.g., Monthly)
1. Add a `view-tab` button for `'monthly'` in `App.jsx`
2. Create `src/components/MonthlyView.jsx`
3. Add branch in `App.jsx` main render
4. Apply `.anim-right` or `.anim-left` with `viewKey` as React `key`
5. Hide date nav conditionally (`view !== 'monthly'`) if needed

### Add a new field to events
1. Add to `EventForm.jsx` state and JSX
2. Validate in `submit()` if required
3. Display in `EventCard.jsx`
4. Pass `categoriesMap` or other lookups via props if the new field references another store
5. IndexedDB stores the full object — no schema migration needed for new optional fields

### Add a new category field (e.g., colour per category)
1. Add the field to the `Category` interface
2. Update `AdminView.jsx` CategoryManager form to include the new input
3. Update `EventCard.jsx` to use it if needed

---

## Common Gotchas

- **Fixed header offset** — the header uses `position: fixed` (not sticky). The scrollable content wrapper uses view-specific padding to prevent content hiding behind it:
  - Daily / Weekly: `paddingTop: 135`, horizontal `32px` — two-row header (logo row + date nav row)
  - Admin: `paddingTop: 100`, horizontal `48px` — single-row header (date nav hidden), wider side margin for a settings-area feel
  - If the header height changes, update these values in `App.jsx`.
- **Flash of wrong theme** — handled by the inline `<script>` in `index.html` `<head>`. Don't remove it.
- **Logo text color is in JSX** — `color: theme === 'dark' ? '#0d1117' : '#fff'` — can't be done with a CSS variable alone.
- **`color-scheme: inherit`** on `input[type="date"]` and `input[type="time"]` — makes browser-native pickers match the current theme.
- **`key` prop on views** — always pass a changing `viewKey` to DailyView/WeeklyView to re-trigger entrance animations.
- **Date comparisons** — always use `dKey()` for string comparison, never `==` on Date objects.
- **IndexedDB is async** — all db helpers return Promises. Always `await` them.
- **Theme uses localStorage, not IndexedDB** — intentional; synchronous read needed before first paint.
- **`eventColor(ev)` handles legacy events** — old events with `category` but no `color` are handled gracefully.
- **Category deletion is non-destructive** — deleting a category leaves `categoryId` on events as a stale string; `categoriesMap[ev.categoryId]` simply returns `undefined` and the badge is not shown.
- **DB version is 2** — if you add another store, bump `DB_VERSION` in `db.js` and add the store in the `upgrade()` callback.
- **`categoriesMap` is memoized** — computed with `useMemo` in `App.jsx` from the `categories` array. Don't recompute it per-render elsewhere.
- **Full-width layout** — the main wrapper has no `maxWidth`. The weekly grid uses `overflow-x: auto` + `minWidth: 840px` to keep all 7 columns visible.
- **Do not reintroduce Framer Motion** — it fails over `file://` UMD and is not needed.
