import { useState } from 'react';
import EventCard from './EventCard';
import Icon from './Icon';
import { dKey, sameDay, addDays, wkStart, DAYS } from '../utils';

export default function WeeklyView({ events, date, onEdit, onDelete, onAddDay, onDrop, viewKey, categoriesMap }) {
  const ws    = wkStart(date);
  const today = new Date();
  const cols  = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

  const [draggedEv,   setDraggedEv]   = useState(null); // event being dragged
  const [dragOverKey, setDragOverKey] = useState(null); // dKey of column being hovered

  const handleDragStart = (ev) => setDraggedEv(ev);

  const handleDragOver = (e, d) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverKey(dKey(d));
  };

  const handleDragLeave = (e) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverKey(null);
    }
  };

  const handleDrop = (e, d) => {
    e.preventDefault();
    setDragOverKey(null);
    if (!draggedEv) return;
    const targetKey = dKey(d);
    if (targetKey === draggedEv.date) { setDraggedEv(null); return; } // same day — no-op
    onDrop(draggedEv, d);
    setDraggedEv(null);
  };

  const handleDragEnd = () => {
    setDraggedEv(null);
    setDragOverKey(null);
  };

  return (
    <div key={viewKey} className="week-scroll" style={{ width: '100%', overflowX: 'auto', paddingBottom: 8 }}>
    <div className="week-grid anim-left" style={{ minWidth: 840 }}>
      {cols.map((d, i) => {
        const isT      = sameDay(d, today);
        const isOver   = dragOverKey === dKey(d);
        const isDiffDay = draggedEv && draggedEv.date !== dKey(d);
        const evs = events
          .filter(e => e.date === dKey(d))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <div key={i}>
            <div className="week-head">
              <div style={{ color: isT ? 'var(--amber)' : 'var(--txt3)' }}>{DAYS[d.getDay()]}</div>
              <span className={`day-num ${isT ? 'today' : ''}`}>{d.getDate()}</span>
            </div>
            <div
              className={`week-col ${isT ? 'is-today' : ''}`}
              onDragOver={e => handleDragOver(e, d)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, d)}
              style={{
                // Highlight drop target
                outline: isOver && isDiffDay ? '2px dashed var(--amber)' : '2px solid transparent',
                background: isOver && isDiffDay ? 'var(--amber-dim)' : undefined,
                transition: 'outline .1s, background .1s',
              }}
            >
              {evs.map((ev, j) => (
                <div key={ev.id} style={{ marginBottom: 4, animationDelay: `${j * 30}ms` }}>
                  <EventCard
                    ev={ev}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    compact
                    draggable
                    onDragStart={handleDragStart}
                    isDragging={draggedEv?.id === ev.id}
                    onDragEnd={handleDragEnd}
                    categoriesMap={categoriesMap}
                  />
                </div>
              ))}

              {/* Drop hint when dragging over an empty or non-source column */}
              {isOver && isDiffDay && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  fontSize: 11, color: 'var(--amber)', padding: '6px 0', opacity: 0.8,
                }}>
                  <Icon name="file_download" size={13} style={{ color: 'var(--amber)' }} /> Drop here
                </div>
              )}

              <button className="add-day-btn no-print" onClick={() => onAddDay(d)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon name="add" size={13} /> Add
              </button>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}
