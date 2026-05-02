# Planner — Schedule App

A polished, dark-themed daily/weekly schedule planner.

## ✨ Features

- **Add / Edit / Delete** events with title, date, start/end time, category, notes
- **Daily view** — sorted list of events for the selected day
- **Weekly view** — 7-column grid with per-day add buttons
- **4 categories**: Work (green), Meeting (blue), Study (purple), Personal (orange)
- **Framer Motion animations** — pop-in on add, slide on view switch, modal scale
- **Today highlighting** — amber accent on current date
- **localStorage persistence** — survives page reloads
- **Print / Export PDF** — opens print dialog with clean black-on-white layout
- **Responsive** — works on desktop, tablet, and mobile

---

## 🚀 Quick Start (Zero Install)

Just open `index.html` directly in any modern browser — no build step needed.
All dependencies are loaded from CDN (React 18, Tailwind, Framer Motion, Google Fonts).

```bash
open index.html
# or double-click the file
```

---

## 🔧 Vite Dev Setup (Optional)

For a proper development environment with hot reload:

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

> **Note:** When using Vite, copy the logic from `index.html` into `src/App.jsx`
> and update imports to use npm packages instead of CDN scripts.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | 18.x | UI framework |
| react-dom | 18.x | DOM rendering |
| framer-motion | 10.x | Animations |
| tailwindcss | 3.x | Utility CSS |

**CDN links used in standalone `index.html`:**
- `https://cdn.tailwindcss.com`
- `https://unpkg.com/react@18/...`
- `https://unpkg.com/react-dom@18/...`
- `https://unpkg.com/@babel/standalone/...`
- `https://cdnjs.cloudflare.com/.../framer-motion.umd.min.js`
- Google Fonts: Playfair Display, JetBrains Mono, DM Sans

---

## 🎨 Design System

**Palette:**
- Background: `#0d1117` (deep slate)
- Cards: `#161b27`
- Accent: `#f0a500` (amber gold) — used for today, primary buttons
- Work: `#4ade80` (green)
- Meeting: `#60a5fa` (blue)
- Study: `#c084fc` (purple)
- Personal: `#fb923c` (orange)

**Typography:**
- Display: Playfair Display (headers, dates)
- Body: DM Sans (UI text)
- Monospace: JetBrains Mono (times, counts)

---

## 🖨️ Print / PDF Export

Click **⬡ Export** → browser print dialog opens.

Print styles automatically:
- Hide all buttons, forms, navigation
- Switch to white background, black text
- Replace category color fills with bordered labels
- Preserve all event data in readable format

To export as PDF: in the print dialog, choose **"Save as PDF"** as the destination.

---

## 🗂️ localStorage Schema

Events are stored under key `planner_events` as a JSON array:

```json
[
  {
    "id": "abc123def",
    "title": "Team standup",
    "date": "2026-05-02",
    "startTime": "09:00",
    "endTime": "09:30",
    "category": "meeting",
    "notes": "Review sprint progress"
  }
]
```
