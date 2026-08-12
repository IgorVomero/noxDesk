const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('noxDesktop', {
  setClickThrough: (enabled) => ipcRenderer.send('set-click-through', enabled),
  hide: () => ipcRenderer.send('hide-nox'),
  setSize: (size) => ipcRenderer.send('set-pet-size', size),
  onClickThroughChanged: (callback) => ipcRenderer.on('click-through-changed', (_event, value) => callback(value))
});
