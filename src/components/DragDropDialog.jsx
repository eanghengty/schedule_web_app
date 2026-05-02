import { useState } from 'react';
import { eventColor } from '../constants';
import { fmt12, dKey, DAYS, MONTHS } from '../utils';
import Icon from './Icon';

const pad = n => String(n).padStart(2, '0');

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

const findConflict = (events, targetDate, startTime, endTime, excludeId) =>
  events.find(e =>
    e.date === dKey(targetDate) &&
    e.id !== excludeId &&
    overlaps(startTime, endTime, e.startTime, e.endTime)
  );

const labelStyle = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '.07em', color: 'var(--txt3)', display: 'block', marginBottom: 5,
};

export default function DragDropDialog({ ev, targetDate, events, onMove, onCopy, onCancel }) {
  const color   = eventColor(ev);
  const dayName = DAYS[targetDate.getDay()];
  const label   = `${dayName}, ${MONTHS[targetDate.getMonth()]} ${targetDate.getDate()}`;

  const [step,     setStep]     = useState('choose');
  const [action,   setAction]   = useState(null);
  const [conflict, setConflict] = useState(null);
  const [newStart, setNewStart] = useState(ev.startTime);
  const [newEnd,   setNewEnd]   = useState(ev.endTime);
  const [timeErr,  setTimeErr]  = useState('');

  const handleAction = (act) => {
    const excludeId = act === 'move' ? ev.id : '__none__';
    const clash = findConflict(events, targetDate, ev.startTime, ev.endTime, excludeId);
    if (!clash) {
      act === 'move' ? onMove(ev) : onCopy(ev);
    } else {
      setAction(act); setConflict(clash); setStep('conflict');
    }
  };

  const handleProceed = () => {
    setTimeErr('');
    if (!newStart || !newEnd)       { setTimeErr('Both times are required.'); return; }
    if (newStart >= newEnd)         { setTimeErr('End time must be after start time.'); return; }
    const excludeId = action === 'move' ? ev.id : '__none__';
    const stillClash = findConflict(events, targetDate, newStart, newEnd, excludeId);
    if (stillClash) {
      setTimeErr(`Still overlaps with "${stillClash.title}" (${fmt12(stillClash.startTime)} – ${fmt12(stillClash.endTime)}). Please adjust.`);
      return;
    }
    const modified = { ...ev, startTime: newStart, endTime: newEnd };
    action === 'move' ? onMove(modified) : onCopy(modified);
  };

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="card anim-modal"
        style={{ maxWidth: 380, width: '100%', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Colour strip */}
        <div style={{ height: 4, background: color }} />

        <div style={{ padding: 24 }}>

          {/* STEP 1 — Choose */}
          {step === 'choose' && <>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>
              Move or Copy?
            </p>
            <div style={{
              fontSize: 12, color: 'var(--txt2)', marginBottom: 6,
              padding: '8px 12px', background: 'var(--bg-raised)',
              borderRadius: 8, border: '1px solid var(--border)', lineHeight: 1.7,
            }}>
              <strong style={{ color: 'var(--txt)' }}>{ev.title}</strong><br />
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                color, fontSize: 11,
              }}>
                <Icon name="schedule" size={12} style={{ color }} />
                {fmt12(ev.startTime)} – {fmt12(ev.endTime)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 20 }}>
              Target: <strong style={{ color: 'var(--amber)' }}>{label}</strong>
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={onCancel}>Cancel</button>
              <button className="btn-ghost" onClick={() => handleAction('copy')}
                style={{ borderColor: color + '66', color, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="content_copy" size={14} /> Copy
              </button>
              <button className="btn-primary" onClick={() => handleAction('move')}
                style={{ background: color, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="drive_file_move" size={14} /> Move
              </button>
            </div>
          </>}

          {/* STEP 2 — Conflict */}
          {step === 'conflict' && <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="warning" size={18} style={{ color: '#ef4444' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>Time Conflict</p>
            </div>
            <div style={{
              fontSize: 12, color: 'var(--txt2)', marginBottom: 14,
              padding: '10px 12px', background: 'rgba(239,68,68,.07)',
              borderRadius: 8, border: '1px solid rgba(239,68,68,.25)', lineHeight: 1.7,
            }}>
              <strong style={{ color: 'var(--txt)' }}>"{ev.title}"</strong> ({fmt12(ev.startTime)} – {fmt12(ev.endTime)})<br />
              clashes with <strong style={{ color: 'var(--txt)' }}>"{conflict.title}"</strong> ({fmt12(conflict.startTime)} – {fmt12(conflict.endTime)})<br />
              on <strong style={{ color: 'var(--amber)' }}>{label}</strong>.
            </div>
            <p style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 12 }}>
              Adjust the time to {action} without conflict:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>New Start</label>
                <input type="time" className="inp" value={newStart}
                  onChange={e => { setNewStart(e.target.value); setTimeErr(''); }} />
              </div>
              <div>
                <label style={labelStyle}>New End</label>
                <input type="time" className="inp" value={newEnd}
                  onChange={e => { setNewEnd(e.target.value); setTimeErr(''); }} />
              </div>
            </div>
            {timeErr && (
              <p className="anim-up" style={{
                fontSize: 11, color: '#ef4444', marginBottom: 12,
                background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.22)',
                borderRadius: 8, padding: '7px 11px',
              }}>{timeErr}</p>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={onCancel}>Cancel</button>
              <button className="btn-ghost" onClick={() => { setStep('choose'); setTimeErr(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="arrow_back" size={14} /> Back
              </button>
              <button className="btn-primary" onClick={handleProceed}
                style={{ background: color, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                {action === 'move'
                  ? <><Icon name="drive_file_move" size={14} /> Move anyway</>
                  : <><Icon name="content_copy" size={14} /> Copy anyway</>}
              </button>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
