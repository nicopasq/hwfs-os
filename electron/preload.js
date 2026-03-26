'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal API to the renderer (offline.html only).
// The Vercel app itself never touches window.electronAPI.
contextBridge.exposeInMainWorld('electronAPI', {
  retry: () => ipcRenderer.invoke('retry'),
});
