import { useState, useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';
import EventForm from './components/EventForm';
import ConfirmDialog from './components/ConfirmDialog';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import AdminView from './components/AdminView';
import DragDropDialog from './components/DragDropDialog';
import { getAllEvents, putEvent, removeEvent, getAllCategories } from './db';
import { dKey, sameDay, addDays, wkStart, loadTheme, saveTheme, DAYS, MONTHS, genId } from './utils';
import { useMemo } from 'react';
import Icon from './components/Icon';

export default function App() {
  const [events,   setEvents]   = useState([]);
  const [view,     setView]     = useState('daily');
  const [date,     setDate]     = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [delId,    setDelId]    = useState(null);
  const [formDate, setFormDate] = useState(null);
  const [viewKey,  setViewKey]  = useState(0);
  const [theme,    setTheme]    = useState(loadTheme);
  const [dragAction,  setDragAction]  = useState(null);
  const [categories,  setCategories]  = useState([]);

  const categoriesMap = useMemo(
    () => Object.fromEntries(categories.map(c => [c.id, c.name])),
    [categories]
  );

  /* Load events and categories from IndexedDB on mount */
  useEffect(() => {
    getAllEvents().then(setEvents);
    getAllCategories().then(setCategories);
  }, []);

  /* Sync theme to <html> attribute and localStorage */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const navigate = dir => {
    setDate(d => {
      const nd = new Date(d);
      view === 'daily' ? nd.setDate(nd.getDate() + dir) : nd.setDate(nd.getDate() + dir * 7);
      return nd;
    });
    setViewKey(k => k + 1);
  };

  const goToday  = () => { setDate(new Date()); setViewKey(k => k + 1); };
  const openAdd  = d  => { setFormDate(d || date); setEditing(null); setShowForm(true); };
  const openEdit = ev => { setEditing(ev); setShowForm(true); };

  const handleSave = async ev => {
    await putEvent(ev);
    setEvents(prev =>
      prev.find(e => e.id === ev.id)
        ? prev.map(e => e.id === ev.id ? ev : e)
        : [...prev, ev]
    );
    setShowForm(false);
    setEditing(null);
  };

  const confirmDel = async () => {
    await removeEvent(delId);
    setEvents(p => p.filter(e => e.id !== delId));
    setDelId(null);
  };

  // Drag-and-drop: called by WeeklyView when a card is dropped on a different day
  const handleDragDrop = (ev, targetDate) => setDragAction({ ev, targetDate });

  // modifiedEv carries the final times (may differ if user adjusted for conflict)
  const handleMove = async (modifiedEv) => {
    const updated = { ...modifiedEv, date: dKey(dragAction.targetDate) };
    await putEvent(updated);
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    setDragAction(null);
  };

  const handleCopy = async (modifiedEv) => {
    const copy = { ...modifiedEv, id: genId(), date: dKey(dragAction.targetDate) };
    await putEvent(copy);
    setEvents(prev => [...prev, copy]);
    setDragAction(null);
  };

  const isToday = sameDay(date, new Date());

  const navLabel = () => {
    if (view === 'daily')
      return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    const ws = wkStart(date), we = addDays(ws, 6);
    if (ws.getMonth() === we.getMonth())
      return `${MONTHS[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`;
    return `${MONTHS[ws.getMonth()]} ${ws.getDate()} – ${MONTHS[we.getMonth()]} ${we.getDate()}, ${ws.getFullYear()}`;
  };

  const glowA = theme === 'dark' ? 'rgba(240,165,0,.07)' : 'rgba(196,127,0,.05)';
  const glowB = theme === 'dark' ? 'rgba(96,165,250,.06)' : 'rgba(59,130,246,.04)';

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', position: 'relative',
      overflowX: 'hidden', transition: 'background 0.3s ease',
    }}>
      {/* Ambient glows */}
      <div className="glow" style={{ width: 500, height: 500, background: glowA, top: -150, right: -100, opacity: .6 }} />
      <div className="glow" style={{ width: 400, height: 400, background: glowB, bottom: -100, left: -80, opacity: .5 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>

        {/* ── Header ── */}
        <header className="no-print anim-up" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'var(--bg)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 32px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>

            {/* Logo + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, background: 'var(--amber)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, color: theme === 'dark' ? '#0d1117' : '#fff',
                flexShrink: 0, fontFamily: "Tahoma, Geneva, sans-serif",
              }}>P</div>
              <h1 style={{ fontFamily: "Tahoma, Geneva, sans-serif", fontSize: 22, fontWeight: 600, color: 'var(--txt)' }}>
                Planner
              </h1>
              {isToday && (
                <span className="today-badge anim-pop" style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 99,
                  fontFamily: "Tahoma, Geneva, sans-serif",
                }}>Today</span>
              )}
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 3, padding: 4, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <button className={`view-tab ${view === 'daily' ? 'active' : ''}`}
                  onClick={() => { setView('daily'); setViewKey(k => k + 1); }}>Daily</button>
                <button className={`view-tab ${view === 'weekly' ? 'active' : ''}`}
                  onClick={() => { setView('weekly'); setViewKey(k => k + 1); }}>Weekly</button>
                <button className={`view-tab ${view === 'admin' ? 'active' : ''}`}
                  onClick={() => setView('admin')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="settings" size={14} /> Admin
                </button>
              </div>

              <ThemeToggle theme={theme} onToggle={toggleTheme} />

              <button className="btn-ghost no-print" onClick={() => window.print()} title="Print or export as PDF"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="print" size={16} /> Export
              </button>
              <button className="btn-primary no-print" onClick={() => openAdd(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="add" size={16} /> Add Event
              </button>
            </div>
          </div>

          {/* Date navigation — hidden in admin view */}
          {view !== 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn-ghost" style={{ padding: '8px 10px' }} onClick={() => navigate(-1)}>
              <Icon name="chevron_left" size={18} />
            </button>
              <div style={{ minWidth: 260, textAlign: 'center' }}>
                <span style={{ fontFamily: "Tahoma, Geneva, sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--txt)' }}>
                  {navLabel()}
                </span>
              </div>
              <button className="btn-ghost" style={{ padding: '8px 10px' }} onClick={() => navigate(1)}>
              <Icon name="chevron_right" size={18} />
            </button>
              {!isToday && (
                <button className="btn-ghost"
                  style={{ color: 'var(--amber)', borderColor: 'rgba(196,127,0,.3)', fontSize: 12, padding: '7px 14px' }}
                  onClick={goToday}>
                  Today
                </button>
              )}
            </div>
          )}
        </header>

        {/* ── Scrollable content ── */}
        <div style={{ padding: '24px 32px 48px', paddingTop: 110 }}>

        {/* Print-only header */}
        <div className="print-header">
          <h1 style={{ fontFamily: "Tahoma, Geneva, sans-serif", fontSize: 22, marginBottom: 4 }}>Schedule</h1>
          <p style={{ fontSize: 14, marginBottom: 12, color: '#555' }}>{navLabel()}</p>
          <hr style={{ borderColor: '#ccc', marginBottom: 16 }} />
        </div>

        {/* ── Main view ── */}
        <main>
          {view === 'daily'   && <DailyView  events={events} date={date} onEdit={openEdit} onDelete={id => setDelId(id)} viewKey={`d${viewKey}`} categoriesMap={categoriesMap} />}
          {view === 'weekly'  && <WeeklyView events={events} date={date} onEdit={openEdit} onDelete={id => setDelId(id)} onAddDay={openAdd} onDrop={handleDragDrop} viewKey={`w${viewKey}`} categoriesMap={categoriesMap} />}
          {view === 'admin'   && <AdminView  events={events} categories={categories} onEventsChange={setEvents} onCategoriesChange={setCategories} />}
        </main>

        {/* Footer */}
        <footer className="no-print" style={{ marginTop: 48, textAlign: 'center', fontSize: 12, color: 'var(--txt3)' }}>
          <span style={{ fontFamily: "Tahoma, Geneva, sans-serif" }}>{events.length}</span>
          {' '}event{events.length !== 1 ? 's' : ''} · saved in IndexedDB ·{' '}
          <span style={{ color: 'var(--txt3)' }}>{theme} mode</span>
        </footer>
        </div>{/* end scrollable content */}
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <EventForm
          initial={editing}
          defaultDate={formDate || date}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
          events={events}
          categories={categories}
        />
      )}
      {delId && (
        <ConfirmDialog
          onConfirm={confirmDel}
          onCancel={() => setDelId(null)}
        />
      )}
      {dragAction && (
        <DragDropDialog
          ev={dragAction.ev}
          targetDate={dragAction.targetDate}
          events={events}
          onMove={handleMove}
          onCopy={handleCopy}
          onCancel={() => setDragAction(null)}
        />
      )}
    </div>
  );
}
