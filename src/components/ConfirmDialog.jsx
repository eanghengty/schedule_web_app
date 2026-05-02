export default function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="card anim-modal" style={{ maxWidth: 340, width: '100%', padding: 24 }}
        onClick={e => e.stopPropagation()}>
        <p style={{ fontFamily: "Tahoma, Geneva, sans-serif", fontSize: 17, marginBottom: 8, color: 'var(--txt)' }}>
          Delete this event?
        </p>
        <p style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 20 }}>
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
