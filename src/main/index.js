const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Важно для локальных ресурсов
      autoHideMenuBar: true
    }
  });

win.removeMenu();

  if (app.isPackaged) {
    // Если это собранный .exe файл - грузим из папки
    win.loadFile(path.join(process.resourcesPath, 'out', 'renderer', 'index.html'));
  } else {
    // В режиме разработки подключаемся к "прямому эфиру" Vite
    // Vite обычно крутится на порту 5173 (или берет порт из настроек)
    const devServerUrl = process.env['ELECTRON_RENDERER_URL'] || 'http://localhost:5173';
    win.loadURL(devServerUrl);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});