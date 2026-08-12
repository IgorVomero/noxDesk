const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('noxDesktop', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  moveBy: (x, y) => ipcRenderer.send('move-nox', x, y),
  setClickThrough: (enabled) => ipcRenderer.send('set-click-through', enabled),
  onSettingsChanged: (callback) => ipcRenderer.on('settings-changed', (_event, value) => callback(value)),
  onCommand: (callback) => ipcRenderer.on('nox-command', (_event, value) => callback(value))
});
