import { useState } from 'react';
import { eventColor } from '../constants';
import { fmt12 } from '../utils';
import Icon from './Icon';

// Convert hex to rgba with given opacity
const hex2rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export default function EventCard({ ev, onEdit, onDelete, compact, draggable, onDragStart, isDragging, categoriesMap = {} }) {
  const color = eventColor(ev);
  const closed = ev.status === 'closed';
  const [hov, setHov] = useState(false);

  return (
    <div
      className="card event-card anim-pop"
      draggable={draggable}
      onDragStart={draggable ? (e) => {
        e.dataTransfer.effectAllowed = 'copyMove';
        onDragStart?.(ev);
      } : undefined}
      style={{
        padding: compact ? '6px 10px' : '10px 14px',
        borderLeft: `3px solid ${color}`,
        opacity: isDragging ? 0.35 : closed ? 0.55 : 1,
        cursor: draggable ? 'grab' : 'pointer',
        transition: 'opacity .15s, transform .15s, box-shadow .15s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => !isDragging && onEdit(ev)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
            {/* Colour label dot + time */}
            <span className="event-color-pill" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 10, padding: '2px 8px', borderRadius: 99,
              background: hex2rgba(color, 0.14),
              border: `1px solid ${hex2rgba(color, 0.35)}`,
              color, fontWeight: 600,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: color, flexShrink: 0,
                boxShadow: `0 0 0 1px ${color}`,
              }} />
              {fmt12(ev.startTime)}–{fmt12(ev.endTime)}
            </span>
            {/* Category badge */}
            {ev.categoryId && categoriesMap[ev.categoryId] && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 99,
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                color: 'var(--txt2)', fontWeight: 500,
              }}>
                {categoriesMap[ev.categoryId]}
              </span>
            )}
            {/* Status badge — only shown when closed */}
            {closed && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 99,
                background: 'rgba(239,68,68,.12)',
                border: '1px solid rgba(239,68,68,.3)',
                color: '#ef4444', fontWeight: 600,
              }}>
                Closed
              </span>
            )}
          </div>
          <p style={{
            fontWeight: 600, fontSize: 13, color: closed ? 'var(--txt3)' : 'var(--txt)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: closed ? 'line-through' : 'none',
          }}>
            {ev.title}
          </p>
          {!compact && ev.notes && (
            <p style={{
              fontSize: 11, color: 'var(--txt2)', marginTop: 3,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {ev.notes}
            </p>
          )}
        </div>
        <div className="no-print" style={{
          display: 'flex', gap: 3,
          opacity: hov ? 1 : 0,
          transition: 'opacity .15s',
          flexShrink: 0,
        }}>
          <button className="btn-icon" title="Edit"
            onClick={e => { e.stopPropagation(); onEdit(ev); }}>
            <Icon name="edit" size={13} />
          </button>
          <button className="btn-icon" title="Delete"
            onClick={e => { e.stopPropagation(); onDelete(ev.id); }}>
            <Icon name="delete" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
