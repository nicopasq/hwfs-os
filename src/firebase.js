/**
 * firebase.js — Real-time multi-user sync
 *
 * Usage:
 *  1. Go to console.firebase.google.com → New project → "hwfs-os"
 *  2. Add Web App → copy the firebaseConfig object
 *  3. Go to Realtime Database → Create database → Start in test mode
 *  4. Paste the config JSON into Settings → Firebase Sync in the app
 *
 * The config is stored in localStorage under "hwfs-fb-config" so it
 * persists across sessions without being bundled into source code.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove, off } from 'firebase/database';

const FB_CFG_KEY    = 'hwfs-fb-config';
const DB_PATH       = 'hwfs-os/data';
const INCOMING_PATH = 'hwfs-os/incoming';

let _db      = null;
let _ref     = null;
let _unsubscribe = null;
let _incomingRef = null;
let _incomingUnsub = null;

/** Save config to localStorage for persistence */
export function saveFirebaseConfig(configObj) {
  try { localStorage.setItem(FB_CFG_KEY, JSON.stringify(configObj)); } catch (e) { /**/ }
}

/** Load previously saved config */
export function loadFirebaseConfig() {
  try {
    const raw = localStorage.getItem(FB_CFG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Remove saved config (disconnect) */
export function clearFirebaseConfig() {
  localStorage.removeItem(FB_CFG_KEY);
  disconnect();
}

/** Initialize Firebase and connect to Realtime Database */
export function connectFirebase(config) {
  try {
    const app    = getApps().length ? getApp() : initializeApp(config);
    _db          = getDatabase(app);
    _ref         = ref(_db, DB_PATH);
    _incomingRef = ref(_db, INCOMING_PATH);
    saveFirebaseConfig(config);
    return { ok: true };
  } catch (e) {
    console.error('Firebase connect failed:', e);
    return { ok: false, error: e.message };
  }
}

/** Subscribe to remote changes. Returns unsubscribe fn. */
export function subscribeFirebase(onRemoteUpdate) {
  if (!_ref) return () => {};
  if (_unsubscribe) _unsubscribe();

  const unsub = onValue(_ref, snap => {
    const val = snap.val();
    if (val) onRemoteUpdate(val);
  }, err => {
    console.warn('Firebase read error:', err);
  });

  _unsubscribe = () => { try { off(_ref); } catch(e) {/***/} };
  return _unsubscribe;
}

/**
 * Subscribe to incoming documents posted by erp-bridge.js.
 * onNewDocs is called with the full incoming map { id: payload, ... }.
 */
export function subscribeIncoming(onNewDocs) {
  if (!_incomingRef) return () => {};
  if (_incomingUnsub) _incomingUnsub();

  const unsub = onValue(_incomingRef, snap => {
    const val = snap.val();
    onNewDocs(val ? Object.values(val) : []);
  }, err => {
    console.warn('Firebase incoming read error:', err);
  });

  _incomingUnsub = () => { try { off(_incomingRef); } catch(e) {/***/} };
  return _incomingUnsub;
}

/** Delete a single incoming document by id (after acting on it) */
export function deleteIncoming(id) {
  if (!_db) return Promise.resolve();
  return remove(ref(_db, INCOMING_PATH + '/' + id))
    .catch(e => console.warn('deleteIncoming failed:', e));
}

/** Push local data to Firebase (debounced in App) */
export function pushFirebase(data) {
  if (!_ref) return Promise.resolve();
  return set(_ref, data).catch(e => console.warn('Firebase push failed:', e));
}

/** Disconnect and clean up listeners */
export function disconnect() {
  if (_unsubscribe)        { _unsubscribe();        _unsubscribe        = null; }
  if (_incomingUnsub)      { _incomingUnsub();      _incomingUnsub      = null; }
  _ref         = null;
  _incomingRef = null;
  _db          = null;
}

export const isConnected = () => !!_ref;
