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
const PORTAL_PATH   = 'hwfs-os/portal';
const MESSAGES_PATH = 'hwfs-os/messages';
const VISITS_PATH   = 'hwfs-os/visits';

let _db      = null;
let _ref     = null;
let _unsubscribe   = null;
let _incomingRef   = null;
let _incomingUnsub = null;
let _messagesRef   = null;
let _messagesUnsub = null;
let _visitsRef     = null;
let _visitsUnsub   = null;

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
    _messagesRef = ref(_db, MESSAGES_PATH);
    _visitsRef   = ref(_db, VISITS_PATH);
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

/** Publish portal data for a job */
export function publishPortal(jobId, portalData) {
  if (!_db) return Promise.reject(new Error('Not connected'));
  return set(ref(_db, PORTAL_PATH + '/' + jobId), portalData)
    .catch(e => { console.warn('publishPortal failed:', e); throw e; });
}

/** Subscribe to all client messages across all jobs */
export function subscribeMessages(onMessages) {
  if (!_messagesRef) return () => {};
  if (_messagesUnsub) _messagesUnsub();

  const unsub = onValue(_messagesRef, snap => {
    const val = snap.val();
    if (!val) { onMessages([]); return; }
    // Flatten: { jobId: { msgId: msg } } → flat array
    const msgs = Object.entries(val).flatMap(([jobId, jobMsgs]) =>
      Object.values(jobMsgs).map(m => ({ ...m, jobId }))
    );
    onMessages(msgs.sort((a, b) => b.ts?.localeCompare(a.ts)));
  }, err => console.warn('Firebase messages read error:', err));

  _messagesUnsub = () => { try { off(_messagesRef); } catch(e) {/***/} };
  return _messagesUnsub;
}

/** Mark a message as read */
export function markMessageRead(jobId, msgId) {
  if (!_db) return Promise.resolve();
  return set(ref(_db, MESSAGES_PATH + '/' + jobId + '/' + msgId + '/read'), true)
    .catch(e => console.warn('markMessageRead failed:', e));
}

/** Send a reply from ERP to a client message thread */
export function sendReply(jobId, msgId, replyText, userId) {
  if (!_db) return Promise.resolve();
  const replyRef = ref(_db, MESSAGES_PATH + '/' + jobId + '/' + msgId + '/reply');
  return set(replyRef, { text: replyText, by: userId, ts: new Date().toISOString() })
    .catch(e => console.warn('sendReply failed:', e));
}

/** Subscribe to all service visit records across all jobs */
export function subscribeVisits(onVisits) {
  if (!_visitsRef) return () => {};
  if (_visitsUnsub) _visitsUnsub();

  const unsub = onValue(_visitsRef, snap => {
    const val = snap.val();
    if (!val) { onVisits([]); return; }
    // Flatten: { jobId: { visitId: visit } } → flat array sorted newest first
    const visits = Object.entries(val).flatMap(([jobId, jobVisits]) =>
      jobVisits ? Object.values(jobVisits).map(v => ({ ...v, jobId })) : []
    );
    onVisits(visits.sort((a, b) => (b.ts || '').localeCompare(a.ts || '')));
  }, err => console.warn('Firebase visits read error:', err));

  _visitsUnsub = () => { try { off(_visitsRef); } catch(e) {/***/} };
  return _visitsUnsub;
}

/** Push local data to Firebase (debounced in App) */
export function pushFirebase(data) {
  if (!_ref) return Promise.resolve();
  return set(_ref, data).catch(e => console.warn('Firebase push failed:', e));
}

/** Disconnect and clean up listeners */
export function disconnect() {
  if (_unsubscribe)   { _unsubscribe();   _unsubscribe   = null; }
  if (_incomingUnsub) { _incomingUnsub(); _incomingUnsub = null; }
  if (_messagesUnsub) { _messagesUnsub(); _messagesUnsub = null; }
  if (_visitsUnsub)   { _visitsUnsub();   _visitsUnsub   = null; }
  _ref         = null;
  _incomingRef = null;
  _messagesRef = null;
  _visitsRef   = null;
  _db          = null;
}

export const isConnected = () => !!_ref;
