const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('npe', {
  getInterfaces: () => ipcRenderer.invoke('get-interfaces'),
  openFileDialog: (filters) => ipcRenderer.invoke('open-file-dialog', filters),
  saveFileDialog: (filters) => ipcRenderer.invoke('save-file-dialog', filters),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, data) => ipcRenderer.invoke('write-file', path, data),
  sendPacket: (opts) => ipcRenderer.invoke('send-packet', opts),
  startSend: (opts) => ipcRenderer.invoke('start-send', opts),
  stopSend: () => ipcRenderer.invoke('stop-send'),
  onSendStat: (cb) => {
    ipcRenderer.on('send-stat', (_, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('send-stat');
  },
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized')
});
