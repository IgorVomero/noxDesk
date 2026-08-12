const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, screen } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const BASE_WINDOW = { width: 340, height: 390 };
const DEFAULTS = { scale: 1, clickThrough: false, autonomous: true };
let windowRef;
let tray;
let settings = { ...DEFAULTS };
let isQuitting = false;

function settingsPath() { return path.join(app.getPath('userData'), 'nox-settings.json'); }
function loadSettings() {
  try { settings = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(settingsPath(), 'utf8')) }; }
  catch { settings = { ...DEFAULTS }; }
}
function saveSettings() { fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2)); }
function windowSize() { return { width: Math.round(BASE_WINDOW.width * settings.scale), height: Math.round(BASE_WINDOW.height * settings.scale) }; }
function showNox() { windowRef?.showInactive(); windowRef?.setAlwaysOnTop(true, 'floating'); }
function sendSettings() { windowRef?.webContents.send('settings-changed', settings); }

function updateSettings(next) {
  settings = { ...settings, ...next };
  saveSettings();
  if (Object.hasOwn(next, 'scale')) windowRef?.setSize(...Object.values(windowSize()), true);
  if (Object.hasOwn(next, 'clickThrough')) windowRef?.setIgnoreMouseEvents(settings.clickThrough, { forward: true });
  sendSettings();
  rebuildTrayMenu();
}

function sendCommand(command) { showNox(); windowRef?.webContents.send('nox-command', command); }

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  const size = windowSize();
  windowRef = new BrowserWindow({
    ...size,
    x: Math.max(workArea.x + workArea.width - size.width - 22, workArea.x),
    y: Math.max(workArea.y + workArea.height - size.height - 46, workArea.y),
    frame: false, transparent: true, resizable: false, skipTaskbar: true, alwaysOnTop: true, hasShadow: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  windowRef.setAlwaysOnTop(true, 'floating');
  windowRef.setIgnoreMouseEvents(settings.clickThrough, { forward: true });
  windowRef.loadFile(path.join(__dirname, 'index.html'));
  windowRef.webContents.once('did-finish-load', sendSettings);
  windowRef.on('close', (event) => { if (!isQuitting) { event.preventDefault(); windowRef.hide(); } });
}

function moveNox(deltaX, deltaY) {
  if (!windowRef) return;
  const bounds = windowRef.getBounds();
  const display = screen.getDisplayNearestPoint({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 });
  const area = display.workArea;
  const x = Math.round(Math.min(Math.max(bounds.x + Number(deltaX || 0), area.x), area.x + area.width - bounds.width));
  const y = Math.round(Math.min(Math.max(bounds.y + Number(deltaY || 0), area.y), area.y + area.height - bounds.height));
  windowRef.setPosition(x, y, false);
}

function rebuildTrayMenu() {
  if (!tray) return;
  const selected = (size) => settings.scale === size;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Mostrar Nox', click: showNox },
    { label: 'Cumprimentar', click: () => sendCommand('greet') },
    { label: 'Recarregar energia', click: () => sendCommand('recharge') },
    { label: 'Transformar', click: () => sendCommand('transform') },
    { type: 'separator' },
    { label: 'Tamanho', submenu: [
      { label: 'Discreto', type: 'radio', checked: selected(0.8), click: () => updateSettings({ scale: 0.8 }) },
      { label: 'Normal', type: 'radio', checked: selected(1), click: () => updateSettings({ scale: 1 }) },
      { label: 'Presença', type: 'radio', checked: selected(1.25), click: () => updateSettings({ scale: 1.25 }) },
      { label: 'Grande', type: 'radio', checked: selected(1.5), click: () => updateSettings({ scale: 1.5 }) }
    ] },
    { label: settings.autonomous ? 'Pausar autonomia' : 'Ativar autonomia', click: () => updateSettings({ autonomous: !settings.autonomous }) },
    { label: settings.clickThrough ? 'Liberar cliques no Nox' : 'Deixar cliques atravessarem', click: () => updateSettings({ clickThrough: !settings.clickThrough }) },
    { type: 'separator' },
    { label: 'Encerrar Nox', click: () => { isQuitting = true; app.quit(); } }
  ]));
}

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  const icon = nativeImage.createFromPath(path.join(__dirname, '..', 'assets', 'transform', 'frame-7.png'));
  tray = new Tray(icon.resize({ width: 20, height: 20 }));
  tray.setToolTip('Nox — guardião online');
  tray.on('click', () => windowRef?.isVisible() ? windowRef.hide() : showNox());
  rebuildTrayMenu();
});

ipcMain.handle('get-settings', () => settings);
ipcMain.on('move-nox', (_event, deltaX, deltaY) => moveNox(deltaX, deltaY));
ipcMain.on('set-click-through', (_event, enabled) => updateSettings({ clickThrough: Boolean(enabled) }));
app.on('window-all-closed', (event) => event.preventDefault());
app.on('activate', showNox);
