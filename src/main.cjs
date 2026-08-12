const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, screen } = require('electron');
const path = require('node:path');

let windowRef;
let tray;
let clickThrough = false;

function createWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay();
  windowRef = new BrowserWindow({
    width: 420,
    height: 500,
    x: Math.max(workAreaSize.width - 470, 20),
    y: Math.max(workAreaSize.height - 570, 20),
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  windowRef.setAlwaysOnTop(true, 'floating');
  windowRef.loadFile(path.join(__dirname, 'index.html'));
  windowRef.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      windowRef.hide();
    }
  });
}

function setClickThrough(enabled) {
  clickThrough = enabled;
  windowRef?.setIgnoreMouseEvents(enabled, { forward: true });
  windowRef?.webContents.send('click-through-changed', enabled);
  rebuildTrayMenu();
}

function rebuildTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Mostrar Nox', click: () => { windowRef?.showInactive(); windowRef?.setAlwaysOnTop(true, 'floating'); } },
    { label: clickThrough ? 'Liberar cliques no Nox' : 'Deixar cliques atravessarem', click: () => setClickThrough(!clickThrough) },
    { type: 'separator' },
    { label: 'Encerrar Nox', click: () => { app.isQuiting = true; app.quit(); } }
  ]));
}

app.whenReady().then(() => {
  createWindow();
  const icon = nativeImage.createFromPath(path.join(__dirname, '..', 'assets', 'transform', 'frame-7.png'));
  tray = new Tray(icon.resize({ width: 20, height: 20 }));
  tray.setToolTip('Nox — guardião online');
  tray.on('click', () => windowRef?.isVisible() ? windowRef.hide() : windowRef?.showInactive());
  rebuildTrayMenu();
});

ipcMain.on('set-click-through', (_event, enabled) => setClickThrough(Boolean(enabled)));
ipcMain.on('hide-nox', () => windowRef?.hide());
ipcMain.on('set-pet-size', (_event, size) => {
  const safe = Math.max(300, Math.min(620, Number(size) || 420));
  windowRef?.setSize(safe, Math.round(safe * 1.19));
});

app.on('window-all-closed', (event) => event.preventDefault());
app.on('activate', () => windowRef?.showInactive());
