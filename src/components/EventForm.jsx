import { useState } from 'react';
import { COLOR_PALETTE, DEFAULT_COLOR, eventColor } from '../constants';
import { dKey, genId } from '../utils';

const labelStyle = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '.07em', color: 'var(--txt3)', display: 'block', marginBottom: 6,
};

export default function EventForm({ initial, defaultDate, onSave, onClose, events = [], categories = [] }) {
  const [f, setF] = useState({
    title: '', date: dKey(defaultDate || new Date()),
    startTime: '09:00', endTime: '10:00',
    color: initial ? eventColor(initial) : DEFAULT_COLOR,
    categoryId: '',
    notes: '',
    ...(initial || {}),
  });
  const [err, setErr] = useState('');
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.title.trim())          { setErr('Title is required.'); return; }
    if (!f.date)                  { setErr('Date is required.');  return; }
    if (f.startTime >= f.endTime) { setErr('End time must be after start time.'); return; }

    // Check for overlapping events on the same date (exclude self when editing)
    const conflict = events.find(e =>
      e.date === f.date &&
      e.id !== f.id &&
      f.startTime < e.endTime &&
      f.endTime > e.startTime
    );
    if (conflict) {
      const fmt = t => { const [h, m] = t.split(':'); const hr = +h; return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };
      setErr(`Time overlaps with "${conflict.title}" (${fmt(conflict.startTime)} – ${fmt(conflict.endTime)})`);
      return;
    }

    setErr('');
    // Strip legacy category field — store color only
    const { category: _dropped, ...rest } = f;
    onSave({ ...rest, id: f.id || genId() });
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card anim-modal" style={{ width: '100%', maxWidth: 440, padding: 28 }}>
        <h2 style={{ fontSize: 20, marginBottom: 20, color: 'var(--txt)' }}>
          {initial?.id ? 'Edit Event' : 'New Event'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input className="inp" placeholder="What's happening?" value={f.title}
              onChange={e => s('title', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" className="inp" value={f.date}
              onChange={e => s('date', e.target.value)} />
          </div>

          {/* Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Start</label>
              <input type="time" className="inp" value={f.startTime}
                onChange={e => s('startTime', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>End</label>
              <input type="time" className="inp" value={f.endTime}
                onChange={e => s('endTime', e.target.value)} />
            </div>
          </div>

          {/* Label colour picker */}
          <div>
            <label style={labelStyle}>Label Colour</label>

            {/* Palette swatches */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {COLOR_PALETTE.map(({ hex, name }) => {
                const selected = f.color === hex;
                return (
                  <button
                    key={hex}
                    title={name}
                    onClick={() => s('color', hex)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: hex, border: 'none', cursor: 'pointer', flexShrink: 0,
                      outline: selected ? `3px solid ${hex}` : '3px solid transparent',
                      outlineOffset: 2,
                      boxShadow: selected ? `0 0 0 1px var(--bg-card)` : 'none',
                      transform: selected ? 'scale(1.18)' : 'scale(1)',
                      transition: 'transform .15s, outline .15s',
                    }}
                  />
                );
              })}
            </div>

            {/* Custom hex input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="color"
                value={f.color}
                onChange={e => s('color', e.target.value)}
                style={{
                  width: 36, height: 32, padding: 2, borderRadius: 6,
                  border: '1px solid var(--border)', background: 'var(--bg-raised)',
                  cursor: 'pointer',
                }}
                title="Custom colour"
              />
              <span style={{ fontSize: 12, color: 'var(--txt2)' }}>or pick a custom colour</span>
              {/* Preview */}
              <span style={{
                marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, padding: '3px 10px', borderRadius: 99,
                background: f.color + '22', border: `1px solid ${f.color}55`, color: f.color,
                fontWeight: 600,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.color }} />
                Preview
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            {categories.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--txt3)', fontStyle: 'italic' }}>
                No categories yet — add them in Admin → Category Management.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {/* None option */}
                <button
                  onClick={() => s('categoryId', '')}
                  style={{
                    fontSize: 12, padding: '4px 14px', borderRadius: 99, cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: !f.categoryId ? 'var(--bg-raised)' : 'transparent',
                    color: !f.categoryId ? 'var(--txt)' : 'var(--txt3)',
                    fontWeight: !f.categoryId ? 600 : 400,
                    outline: !f.categoryId ? '2px solid var(--amber)' : 'none',
                    outlineOffset: 2,
                    transition: 'all .15s',
                  }}>
                  None
                </button>
                {categories.map(cat => {
                  const sel = f.categoryId === cat.id;
                  return (
                    <button key={cat.id} onClick={() => s('categoryId', cat.id)} style={{
                      fontSize: 12, padding: '4px 14px', borderRadius: 99, cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: sel ? 'var(--bg-raised)' : 'transparent',
                      color: sel ? 'var(--txt)' : 'var(--txt2)',
                      fontWeight: sel ? 600 : 400,
                      outline: sel ? '2px solid var(--amber)' : 'none',
                      outlineOffset: 2,
                      transition: 'all .15s',
                    }}>
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea className="inp" rows={3} placeholder="Optional notes…"
              value={f.notes} onChange={e => s('notes', e.target.value)}
              style={{ resize: 'vertical' }} />
          </div>

          {err && (
            <p className="anim-up" style={{
              fontSize: 12, color: '#ef4444',
              background: 'rgba(239,68,68,.1)',
              border: '1px solid rgba(239,68,68,.25)',
              borderRadius: 8, padding: '8px 12px',
            }}>{err}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}
            style={{ background: f.color, color: '#fff' }}>
            {initial?.id ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
