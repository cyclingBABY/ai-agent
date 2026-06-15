const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('taskpilotAPI', {
  getSystemState: () => Promise.resolve({ platform: process.platform, arch: process.arch }),
});

