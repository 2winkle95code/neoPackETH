const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let sendProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'neoPackETH',
    backgroundColor: '#0d1117',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    if (sendProcess) sendProcess.kill();
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (sendProcess) sendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Get network interfaces
ipcMain.handle('get-interfaces', async () => {
  const nets = os.networkInterfaces();
  return Object.keys(nets).filter(name => {
    const addrs = nets[name];
    return addrs && addrs.some(a => !a.internal);
  });
});

// Open file dialog
ipcMain.handle('open-file-dialog', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [{ name: 'PCAP Files', extensions: ['pcap', 'pcapng', 'cap'] }]
  });
  return result.canceled ? null : result.filePaths[0];
});

// Save file dialog
ipcMain.handle('save-file-dialog', async (event, filters) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: filters || [{ name: 'Packet Files', extensions: ['pkt', 'hex'] }]
  });
  return result.canceled ? null : result.filePath;
});

// Read file contents
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    return { success: true, data: Array.from(data) };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Write file
ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, Buffer.from(data));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Send packet using packETH CLI or raw socket
ipcMain.handle('send-packet', async (event, opts) => {
  // opts: { interface, hexData, count, gapUs, mode }
  // This calls the packETHcli or a custom sender script with sudo
  // For now returns mock success — actual implementation requires sudo + raw sockets
  return { success: true, message: 'Packet queued (requires root privileges)' };
});

// Start continuous send — spawns subprocess
ipcMain.handle('start-send', async (event, opts) => {
  if (sendProcess) {
    sendProcess.kill();
    sendProcess = null;
  }
  // Mock implementation — wire to packETHcli in production
  mainWindow.webContents.send('send-stat', { sent: 0, bytes: 0, pps: 0, running: true });
  let sent = 0;
  const interval = setInterval(() => {
    if (!sendProcess) { clearInterval(interval); return; }
    sent++;
    mainWindow.webContents.send('send-stat', {
      sent,
      bytes: sent * (opts.packetLen || 64),
      pps: Math.round(1e6 / Math.max(opts.gapUs || 1000, 1)),
      running: true
    });
  }, Math.max((opts.gapUs || 1000) / 1000, 16));
  sendProcess = { kill: () => { clearInterval(interval); mainWindow?.webContents.send('send-stat', { running: false }); } };
  return { success: true };
});

ipcMain.handle('stop-send', async () => {
  if (sendProcess) { sendProcess.kill(); sendProcess = null; }
  return { success: true };
});

// ── Window controls (custom frameless title bar) ──────────────────
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
  return mainWindow.isMaximized();
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});
