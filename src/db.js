import { openDB } from 'idb';

const DB_NAME    = 'planner-db';
const DB_VERSION = 2;          // bumped to add categories store

const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
    },
  });

/* ── Events ── */
export const getAllEvents  = async ()     => (await getDB()).getAll('events');
export const putEvent     = async (ev)   => (await getDB()).put('events', ev);
export const removeEvent  = async (id)   => (await getDB()).delete('events', id);

/* ── Categories ── */
export const getAllCategories  = async ()    => (await getDB()).getAll('categories');
export const putCategory      = async (cat) => (await getDB()).put('categories', cat);
export const removeCategory   = async (id)  => (await getDB()).delete('categories', id);
