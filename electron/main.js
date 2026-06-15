const { app: electronApp, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backgroundServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = process.env.ELECTRON_VITE_URL;
  if (url) {
    mainWindow.loadURL(url);
  } else {
    // production: serve bundled Vite dist
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackgroundServer() {
  // Start the existing Express/Vite server.ts in a child process.
  // We use the already-existing REST API contract.
  const serverEntry = path.join(__dirname, '..', 'server.ts');

  backgroundServer = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsx', serverEntry], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      PORT: process.env.PORT || '3000',
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  backgroundServer.stdout.on('data', (d) => console.log(String(d).trim()));
  backgroundServer.stderr.on('data', (d) => console.error(String(d).trim()));
}

electronApp.whenReady().then(() => {
  // serve UI from vite dev server
  // (ELECTRON_VITE_URL is provided by npm script)
  startBackgroundServer();
  createWindow();

  // Alt+Space toggle focus
  globalShortcut.register('Alt+Space', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit();
  }
});

electronApp.on('will-quit', () => {
  try {
    globalShortcut.unregisterAll();
  } catch (_) {}
  if (backgroundServer) {
    try {
      backgroundServer.kill();
    } catch (_) {}
  }
});

