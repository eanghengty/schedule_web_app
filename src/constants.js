// Legacy — kept for backwards-compat migration of old events
export const CATS = {
  work:     { label: 'Work',     color: '#4ade80' },
  meeting:  { label: 'Meeting',  color: '#60a5fa' },
  study:    { label: 'Study',    color: '#c084fc' },
  personal: { label: 'Personal', color: '#fb923c' },
};

// Colour palette for the label colour picker
export const COLOR_PALETTE = [
  { hex: '#ef4444', name: 'Red'     },
  { hex: '#f97316', name: 'Orange'  },
  { hex: '#eab308', name: 'Yellow'  },
  { hex: '#22c55e', name: 'Green'   },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#06b6d4', name: 'Cyan'    },
  { hex: '#3b82f6', name: 'Blue'    },
  { hex: '#6366f1', name: 'Indigo'  },
  { hex: '#8b5cf6', name: 'Violet'  },
  { hex: '#a855f7', name: 'Purple'  },
  { hex: '#ec4899', name: 'Pink'    },
  { hex: '#f43f5e', name: 'Rose'    },
  { hex: '#14b8a6', name: 'Teal'    },
  { hex: '#f59e0b', name: 'Amber'   },
  { hex: '#84cc16', name: 'Lime'    },
  { hex: '#64748b', name: 'Slate'   },
];

export const DEFAULT_COLOR = '#3b82f6';

// Derive colour for an event (supports both old category-based and new color-based events)
export const eventColor = (ev) =>
  ev.color || CATS[ev.category]?.color || DEFAULT_COLOR;
