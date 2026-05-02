import { useState, useRef } from 'react';
import { putEvent, removeEvent, putCategory, removeCategory } from '../db';
import { eventColor } from '../constants';
import { genId } from '../utils';
import Icon from './Icon';

/* ── Shared styles ── */
const section = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 12, padding: 24, marginBottom: 20,
};
const sectionTitle = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 13, fontWeight: 700, color: 'var(--txt)',
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em',
};
const sectionDesc = { fontSize: 12, color: 'var(--txt2)', marginBottom: 16, lineHeight: 1.6 };
const infoRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
};
const labelStyle = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '.07em', color: 'var(--txt3)', display: 'block', marginBottom: 5,
};

/* ── Toast ── */
function Toast({ message, type }) {
  if (!message) return null;
  const isErr = type === 'error';
  return (
    <div className="anim-up" style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 200,
      background: isErr ? 'rgba(239,68,68,.12)' : 'rgba(5,150,105,.12)',
      border: `1px solid ${isErr ? 'rgba(239,68,68,.35)' : 'rgba(5,150,105,.35)'}`,
      color: isErr ? '#ef4444' : '#059669',
      borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 500,
      maxWidth: 340, boxShadow: '0 4px 24px var(--shadow)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon name={isErr ? 'error' : 'check_circle'} size={16} style={{ color: isErr ? '#ef4444' : '#059669' }} />
      {message}
    </div>
  );
}

/* ── Category Manager ── */
function CategoryManager({ categories, events, onCategoriesChange, showToast }) {
  const [newName,  setNewName]  = useState('');
  const [editId,   setEditId]   = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const usageCount = (catId) => events.filter(e => e.categoryId === catId).length;

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      showToast('A category with that name already exists.', 'error'); return;
    }
    const cat = { id: genId(), name };
    await putCategory(cat);
    onCategoriesChange([...categories, cat]);
    setNewName('');
    showToast(`Category "${name}" created`);
  };

  const handleSaveEdit = async (cat) => {
    const name = editName.trim();
    if (!name) return;
    if (categories.some(c => c.id !== cat.id && c.name.toLowerCase() === name.toLowerCase())) {
      showToast('A category with that name already exists.', 'error'); return;
    }
    const updated = { ...cat, name };
    await putCategory(updated);
    onCategoriesChange(categories.map(c => c.id === cat.id ? updated : c));
    setEditId(null);
    showToast(`Renamed to "${name}"`);
  };

  const handleDelete = async (catId) => {
    await removeCategory(catId);
    onCategoriesChange(categories.filter(c => c.id !== catId));
    setDeleteId(null);
    showToast('Category deleted');
  };

  return (
    <div>
      {categories.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 16, fontStyle: 'italic' }}>
          No categories yet. Add one below.
        </p>
      ) : (
        <div style={{ marginBottom: 18 }}>
          {categories.map(cat => {
            const count     = usageCount(cat.id);
            const isEditing = editId === cat.id;
            const isDeleting = deleteId === cat.id;

            return (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0', borderBottom: '1px solid var(--border)',
              }}>
                {isEditing ? (
                  <>
                    <input className="inp" autoFocus value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(cat); if (e.key === 'Escape') setEditId(null); }}
                      style={{ flex: 1, padding: '5px 10px', fontSize: 13 }} />
                    <button className="btn-primary" style={{ padding: '5px 14px', fontSize: 12 }}
                      onClick={() => handleSaveEdit(cat)}>Save</button>
                    <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : isDeleting ? (
                  <div className="anim-up" style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8,
                    background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--txt)', flex: 1 }}>
                      Delete <strong>{cat.name}</strong>?
                      {count > 0 && (
                        <span style={{ color: '#ef4444', marginLeft: 4 }}>
                          {count} event{count !== 1 ? 's' : ''} use this category.
                        </span>
                      )}
                    </span>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => setDeleteId(null)}>Cancel</button>
                    <button className="btn-primary btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => handleDelete(cat.id)}>Delete</button>
                  </div>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {cat.name}
                      <span style={{
                        fontSize: 10, padding: '1px 8px', borderRadius: 99,
                        background: 'var(--bg-raised)', color: 'var(--txt3)', border: '1px solid var(--border)',
                      }}>
                        {count} event{count !== 1 ? 's' : ''}
                      </span>
                    </span>
                    <button className="btn-icon" title="Rename"
                      onClick={() => { setEditId(cat.id); setEditName(cat.name); }}>
                      <Icon name="edit" size={13} />
                    </button>
                    <button className="btn-icon" title="Delete" onClick={() => setDeleteId(cat.id)}>
                      <Icon name="delete" size={13} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <label style={labelStyle}>New Category</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="inp" placeholder="e.g. Client Work, Personal, Study…"
          value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} style={{ flex: 1 }} />
        <button className="btn-primary" onClick={handleAdd} disabled={!newName.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <Icon name="add" size={15} /> Add
        </button>
      </div>
    </div>
  );
}

/* ── Main AdminView ── */
export default function AdminView({ events, categories, onEventsChange, onCategoriesChange }) {
  const [importing,    setImporting]    = useState(false);
  const [importMode,   setImportMode]   = useState('merge');
  const [preview,      setPreview]      = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast,        setToast]        = useState({ message: '', type: '' });
  const fileRef = useRef();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3500);
  };

  /* Stats */
  const sorted    = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const earliest  = sorted[0]?.date ?? '—';
  const latest    = sorted[sorted.length - 1]?.date ?? '—';
  const colorCounts = events.reduce((acc, e) => {
    const c = eventColor(e); acc[c] = (acc[c] || 0) + 1; return acc;
  }, {});

  /* Export */
  const handleExport = () => {
    const payload = { exportedAt: new Date().toISOString(), version: 2, events, categories };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${events.length} events & ${categories.length} categories`);
  };

  /* Import — file pick */
  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed  = JSON.parse(ev.target.result);
        const evList  = Array.isArray(parsed) ? parsed : (parsed.events ?? []);
        const catList = parsed.categories ?? [];
        if (!Array.isArray(evList)) throw new Error('Invalid format: no events array found.');
        if (evList.length > 0 && (!evList[0].id || !evList[0].title || !evList[0].date))
          throw new Error('Invalid format: events are missing required fields.');
        setPreview({ evList, catList, fileName: file.name, exportedAt: parsed.exportedAt ?? null });
      } catch (err) { showToast(err.message, 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* Import — confirm */
  const handleImportConfirm = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      if (importMode === 'replace') {
        for (const ev  of events)           await removeEvent(ev.id);
        for (const ev  of preview.evList)   await putEvent(ev);
        for (const cat of preview.catList)  await putCategory(cat);
        onEventsChange(preview.evList);
        onCategoriesChange(preview.catList);
        showToast(`Replaced — ${preview.evList.length} events & ${preview.catList.length} categories restored`);
      } else {
        const existingEvIds  = new Set(events.map(e => e.id));
        const existingCatIds = new Set(categories.map(c => c.id));
        const newEvs  = preview.evList.filter(e  => !existingEvIds.has(e.id));
        const newCats = preview.catList.filter(c => !existingCatIds.has(c.id));
        for (const ev  of newEvs)  await putEvent(ev);
        for (const cat of newCats) await putCategory(cat);
        onEventsChange([...events, ...newEvs]);
        onCategoriesChange([...categories, ...newCats]);
        showToast(`Merged ${newEvs.length} events & ${newCats.length} categories`);
      }
    } catch (err) { showToast('Import failed: ' + err.message, 'error'); }
    setImporting(false);
    setPreview(null);
  };

  /* Clear all */
  const handleClearAll = async () => {
    for (const ev of events) await removeEvent(ev.id);
    onEventsChange([]);
    setConfirmClear(false);
    showToast('All events deleted');
  };

  return (
    <div className="anim-right" style={{ maxWidth: 720 }}>

      {/* Overview */}
      <div style={section}>
        <p style={sectionTitle}><Icon name="bar_chart" size={16} /> Overview</p>
        <p style={sectionDesc}>Current data stored in IndexedDB.</p>
        <div>
          <div style={infoRow}>
            <span style={{ color: 'var(--txt2)' }}>Total events</span>
            <strong style={{ color: 'var(--txt)' }}>{events.length}</strong>
          </div>
          <div style={infoRow}>
            <span style={{ color: 'var(--txt2)' }}>Categories</span>
            <strong style={{ color: 'var(--txt)' }}>{categories.length}</strong>
          </div>
          <div style={infoRow}>
            <span style={{ color: 'var(--txt2)' }}>Earliest event</span>
            <span style={{ color: 'var(--txt)' }}>{earliest}</span>
          </div>
          <div style={{ ...infoRow, borderBottom: 'none' }}>
            <span style={{ color: 'var(--txt2)' }}>Latest event</span>
            <span style={{ color: 'var(--txt)' }}>{latest}</span>
          </div>
        </div>
        {events.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {Object.entries(colorCounts).map(([hex, count]) => (
              <span key={hex} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, padding: '3px 12px', borderRadius: 99,
                background: hex + '20', border: `1px solid ${hex}44`, color: hex, fontWeight: 600,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: hex }} />
                {count} event{count !== 1 ? 's' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Category Management */}
      <div style={section}>
        <p style={sectionTitle}><Icon name="label" size={16} /> Category Management</p>
        <p style={sectionDesc}>
          Create and manage categories. Assign them when adding or editing events.
          Deleting a category does not delete its events.
        </p>
        <CategoryManager
          categories={categories} events={events}
          onCategoriesChange={onCategoriesChange} showToast={showToast}
        />
      </div>

      {/* Export */}
      <div style={section}>
        <p style={sectionTitle}><Icon name="download" size={16} /> Export Backup</p>
        <p style={sectionDesc}>
          Download all events and categories as a <code style={{ color: 'var(--amber)', fontSize: 11 }}>.json</code> file.
          Store it somewhere safe — use it to restore on any device.
        </p>
        <button className="btn-primary" onClick={handleExport} disabled={events.length === 0}
          style={{ opacity: events.length === 0 ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="download" size={15} /> Download Backup ({events.length} event{events.length !== 1 ? 's' : ''})
        </button>
      </div>

      {/* Import */}
      <div style={section}>
        <p style={sectionTitle}><Icon name="upload" size={16} /> Import / Restore</p>
        <p style={sectionDesc}>
          Restore from a backup file. <strong>Merge</strong> adds alongside existing data.
          <strong> Replace</strong> wipes and restores everything.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['merge', 'replace'].map(m => (
            <button key={m} className={`view-tab ${importMode === m ? 'active' : ''}`}
              onClick={() => setImportMode(m)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name={m === 'merge' ? 'merge' : 'sync'} size={14} />
              {m === 'merge' ? 'Merge' : 'Replace All'}
            </button>
          ))}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--txt2)', marginBottom: 16,
          padding: '8px 12px', background: 'var(--bg-raised)',
          borderRadius: 8, border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <Icon name={importMode === 'merge' ? 'info' : 'warning'} size={14}
            style={{ color: importMode === 'merge' ? 'var(--txt3)' : '#f59e0b', marginTop: 1, flexShrink: 0 }} />
          {importMode === 'merge'
            ? 'New events and categories will be added. Duplicates (same ID) are skipped.'
            : 'All current events will be deleted and replaced. Categories will also be replaced.'}
        </div>
        <button className="btn-ghost" onClick={() => fileRef.current.click()}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="folder_open" size={15} /> Choose Backup File
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json"
          style={{ display: 'none' }} onChange={handleFilePick} />

        {preview && (
          <div className="anim-up" style={{
            marginTop: 16, padding: 16, background: 'var(--bg-raised)',
            borderRadius: 10, border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="description" size={14} style={{ color: 'var(--txt3)' }} />
              <strong style={{ color: 'var(--txt)' }}>{preview.fileName}</strong>
              {preview.exportedAt && <span> · exported {new Date(preview.exportedAt).toLocaleDateString()}</span>}
            </p>
            <p style={{ fontSize: 13, color: 'var(--txt)', marginBottom: 14 }}>
              <strong>{preview.evList.length}</strong> event{preview.evList.length !== 1 ? 's' : ''} &amp;{' '}
              <strong>{preview.catList.length}</strong> categor{preview.catList.length !== 1 ? 'ies' : 'y'} found.
              {importMode === 'replace' && (
                <span style={{ color: '#ef4444', marginLeft: 6 }}>
                  This will delete your {events.length} existing events.
                </span>
              )}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => setPreview(null)}>Cancel</button>
              <button className={`btn-primary ${importMode === 'replace' ? 'btn-danger' : ''}`}
                onClick={handleImportConfirm} disabled={importing}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={importMode === 'merge' ? 'merge' : 'sync'} size={14} />
                {importing ? 'Importing…' : importMode === 'merge' ? 'Confirm Merge' : 'Confirm Replace'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{ ...section, borderColor: 'rgba(239,68,68,.25)' }}>
        <p style={{ ...sectionTitle, color: '#ef4444' }}>
          <Icon name="warning" size={16} style={{ color: '#ef4444' }} /> Danger Zone
        </p>
        <p style={sectionDesc}>Permanently delete all events. Categories are not affected.</p>
        {!confirmClear ? (
          <button className="btn-ghost"
            style={{ borderColor: 'rgba(239,68,68,.4)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setConfirmClear(true)} disabled={events.length === 0}>
            <Icon name="delete_forever" size={15} style={{ color: '#ef4444' }} /> Delete All Events
          </button>
        ) : (
          <div className="anim-up" style={{
            padding: 14, background: 'rgba(239,68,68,.07)',
            border: '1px solid rgba(239,68,68,.25)', borderRadius: 10,
          }}>
            <p style={{ fontSize: 13, color: 'var(--txt)', marginBottom: 12 }}>
              Are you sure? <strong>{events.length} event{events.length !== 1 ? 's' : ''}</strong> will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => setConfirmClear(false)}>Cancel</button>
              <button className="btn-primary btn-danger" onClick={handleClearAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="delete_forever" size={14} /> Yes, Delete All
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
