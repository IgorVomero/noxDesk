const { contextBridge, ipcRenderer } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

let meshAsset = { base64: '', error: '' };
try {
  meshAsset = {
    base64: fs.readFileSync(path.join(__dirname, '..', 'assets', 'models', 'nox-quadruped-prototype.glb')).toString('base64'),
    error: ''
  };
} catch (error) {
  meshAsset.error = error.message;
}

contextBridge.exposeInMainWorld('noxDesktop', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  readMeshAsset: () => meshAsset,
  moveBy: (x, y) => ipcRenderer.send('move-nox', x, y),
  setClickThrough: (enabled) => ipcRenderer.send('set-click-through', enabled),
  onSettingsChanged: (callback) => ipcRenderer.on('settings-changed', (_event, value) => callback(value)),
  onCommand: (callback) => ipcRenderer.on('nox-command', (_event, value) => callback(value))
});
