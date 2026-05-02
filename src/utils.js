export const pad    = n => String(n).padStart(2, '0');
export const genId  = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
export const dKey   = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const sameDay= (a, b) => dKey(a) === dKey(b);
export const addDays= (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
export const wkStart= d => { const r = new Date(d); r.setDate(r.getDate() - r.getDay()); return r; };
export const fmt12  = t => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const loadTheme = () => localStorage.getItem('planner_theme') || 'dark';
export const saveTheme = t  => localStorage.setItem('planner_theme', t);

export const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];
