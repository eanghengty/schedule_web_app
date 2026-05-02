import EventCard from './EventCard';
import { dKey } from '../utils';

export default function DailyView({ events, date, onEdit, onDelete, viewKey, categoriesMap }) {
  const dayEvs = events
    .filter(e => e.date === dKey(date))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div key={viewKey} className="anim-right" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {dayEvs.length === 0 ? (
        <div className="anim-up" style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
          <p style={{ fontFamily: "Tahoma, Geneva, sans-serif", fontSize: 22, color: 'var(--txt3)' }}>
            Nothing scheduled.
          </p>
          <p style={{ fontSize: 13, color: 'var(--txt3)', opacity: .6, marginTop: 8 }}>
            Press <strong>+ Add Event</strong> to get started.
          </p>
        </div>
      ) : dayEvs.map((ev, i) => (
        <div key={ev.id} style={{ animationDelay: `${i * 35}ms` }}>
          <EventCard ev={ev} onEdit={onEdit} onDelete={onDelete} categoriesMap={categoriesMap} />
        </div>
      ))}
    </div>
  );
}
