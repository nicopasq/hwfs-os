'use strict';

const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const dns  = require('dns');

// ── Config ────────────────────────────────────────────────────────────────────
const APP_URL = 'https://hwfs-os.vercel.app';
const IS_DEV  = !app.isPackaged;

// ── Suppress default menu ─────────────────────────────────────────────────────
Menu.setApplicationMenu(null);

// ── Connectivity check ────────────────────────────────────────────────────────
function isOnline() {
  return new Promise(resolve => {
    dns.lookup('vercel.app', err => resolve(!err));
  });
}

// ── Icon path ─────────────────────────────────────────────────────────────────
function iconPath() {
  const file = process.platform === 'win32'  ? 'icon.ico'
             : process.platform === 'darwin' ? 'icon.icns'
             : 'icon.png';
  return path.join(__dirname, 'assets', file);
}

// ── Main window ───────────────────────────────────────────────────────────────
let mainWindow = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width:     1280,
    height:    800,
    minWidth:  1024,
    minHeight: 768,
    title:     'HuronWest',
    icon:      iconPath(),
    show:      false,
    backgroundColor: '#0b0e15',
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      sandbox:          true,
      devTools:         IS_DEV,
      preload:          path.join(__dirname, 'preload.js'),
    },
  });

  // Start maximized; show only once the window is ready to paint
  mainWindow.maximize();
  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Block devtools in production (keyboard shortcuts + accidental open)
  if (!IS_DEV) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
    mainWindow.webContents.on('before-input-event', (event, input) => {
      const devKey =
        (input.key === 'F12') ||
        ((input.control || input.meta) && input.shift && input.key === 'I') ||
        ((input.control || input.meta) && input.shift && input.key === 'J') ||
        ((input.control || input.meta) && input.key === 'u');
      if (devKey) event.preventDefault();
    });
  }

  // External links → default browser, not inside Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_URL) || url.startsWith('about:')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_URL) &&
        !url.startsWith('file://') &&
        !url.startsWith('about:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  const online = await isOnline();

  if (!online) {
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    return;
  }

  mainWindow.loadURL(APP_URL);

  // Handle in-session connection loss or load failure
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, _desc, failedUrl) => {
    // errorCode < 0 means a network-level error (not an HTTP 4xx/5xx)
    if (failedUrl === APP_URL && errorCode < 0) {
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    }
  });
}

// ── IPC: retry from the offline page ─────────────────────────────────────────
ipcMain.handle('retry', async () => {
  const online = await isOnline();
  if (online && mainWindow) {
    mainWindow.loadURL(APP_URL);
    return true;
  }
  return false;
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  await createWindow();

  // Check for desktop-client updates (production only)
  if (!IS_DEV) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
