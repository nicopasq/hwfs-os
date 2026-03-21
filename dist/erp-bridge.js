/**
 * erp-bridge.js — HuronWest ERP Document Bridge
 *
 * Drop this script into any HuronWest HTML document:
 *   <script src="/erp-bridge.js"></script>
 *
 * It will:
 *  1. Add a "Send to ERP" button to the .toolbar element
 *  2. Collect all [data-erp="field-name"] inputs when clicked
 *  3. POST the document to Firebase via REST (reads hwfs-fb-config from localStorage)
 *  4. Show a toast confirmation
 *
 * No build step needed — works as a plain <script> tag.
 */
(function () {
  'use strict';

  // ── Document type detection ───────────────────────────────────────────────
  function detectDocType() {
    const t = document.title.toLowerCase();
    if (t.includes('master service') || t.includes('msa')) return 'MSA';
    if (t.includes('bid') || t.includes('walk-through') || t.includes('walkthrough')) return 'BidSheet';
    if (t.includes('invoice')) return 'Invoice';
    if (t.includes('completion') || t.includes('completion report') || t.includes('ccr')) return 'CCR';
    if (t.includes('exhibit a') || t.includes('scope of work')) return 'ExhibitA';
    return 'Document';
  }

  // ── Field collection ──────────────────────────────────────────────────────
  function collectFields() {
    var fields = {};

    // Primary: explicitly tagged fields
    document.querySelectorAll('[data-erp]').forEach(function (el) {
      var key = el.getAttribute('data-erp');
      var val = el.tagName === 'TEXTAREA' ? el.value : (el.value || el.textContent || '');
      fields[key] = val.trim();
    });

    return fields;
  }

  // ── Toast notification ────────────────────────────────────────────────────
  function showToast(msg, type) {
    var existing = document.getElementById('erp-bridge-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'erp-bridge-toast';
    toast.textContent = msg;
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '28px',
      right:        '28px',
      padding:      '14px 22px',
      background:   type === 'success' ? '#3A7D44' : '#C62828',
      color:        '#fff',
      fontFamily:   "'Outfit', sans-serif",
      fontSize:     '13px',
      fontWeight:   '600',
      borderRadius: '4px',
      boxShadow:    '0 8px 24px rgba(0,0,0,0.18)',
      zIndex:       '999999',
      opacity:      '1',
      transition:   'opacity 0.4s',
      letterSpacing:'0.3px',
      maxWidth:     '340px',
      lineHeight:   '1.4',
    });
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 500);
    }, type === 'success' ? 3000 : 5000);
  }

  // ── Send to Firebase REST API ─────────────────────────────────────────────
  function sendToERP() {
    var cfgRaw = localStorage.getItem('hwfs-fb-config');
    if (!cfgRaw) {
      showToast('Not connected to ERP. Open the ERP app → Settings → Firebase Sync and connect first.', 'error');
      return;
    }

    var cfg;
    try { cfg = JSON.parse(cfgRaw); } catch (e) {
      showToast('Firebase config is corrupted. Please reconnect in ERP Settings.', 'error');
      return;
    }

    var dbUrl = (cfg.databaseURL || '').replace(/\/$/, '');
    if (!dbUrl) {
      showToast('Firebase config is missing databaseURL. Please reconnect.', 'error');
      return;
    }

    var fields   = collectFields();
    var docType  = detectDocType();
    var id       = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    var payload = {
      id:          id,
      docType:     docType,
      title:       document.title,
      fields:      fields,
      submittedAt: new Date().toISOString(),
      status:      'new',
    };

    // Firebase REST: PUT to /hwfs-os/incoming/{id}.json
    var url = dbUrl + '/hwfs-os/incoming/' + id + '.json';

    // Use XMLHttpRequest for broadest browser compat (no fetch needed)
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        showToast('✓ Document sent to ERP — check the Inbox tab.', 'success');
      } else {
        showToast('Send failed (HTTP ' + xhr.status + '). Check Firebase rules allow write.', 'error');
      }
    };
    xhr.onerror = function () {
      showToast('Network error. Make sure you have internet access and Firebase is connected.', 'error');
    };

    xhr.send(JSON.stringify(payload));
  }

  // ── Inject "Send to ERP" button into .toolbar ─────────────────────────────
  function injectButton() {
    var toolbar = document.querySelector('.toolbar');
    if (!toolbar) return; // document doesn't use standard toolbar

    // Avoid double-injection
    if (document.getElementById('erp-send-btn')) return;

    var btn = document.createElement('button');
    btn.id        = 'erp-send-btn';
    btn.className = 'tool-btn';
    btn.textContent = '⇪ Send to ERP';
    Object.assign(btn.style, {
      background:  '#3A7D44',
      borderColor: '#3A7D44',
      color:       '#fff',
      fontWeight:  '600',
    });
    btn.addEventListener('mouseenter', function () {
      btn.style.background = '#2E6B38';
      btn.style.borderColor = '#2E6B38';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.background = '#3A7D44';
      btn.style.borderColor = '#3A7D44';
    });
    btn.addEventListener('click', sendToERP);
    toolbar.appendChild(btn);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();
