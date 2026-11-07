const { app, BrowserWindow, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

// Регистрация AppUserModelId для правильной группировки и отображения иконки в панели задач Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.dnd.dashboard');
}

function createWindow() {
  nativeTheme.themeSource = 'dark';

  // Иконка приложения для окна и панели задач Windows
  let iconPath = path.join(__dirname, '../../resources/icon.ico');
  if (app.isPackaged) {
    const candidates = [
      path.join(process.resourcesPath, 'resources', 'icon.ico'),
      path.join(process.resourcesPath, 'icon.ico'),
      path.join(__dirname, '../../resources/icon.ico')
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        iconPath = c;
        break;
      }
    }
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#1e1f22',
    title: 'DnD Dashboard — Master Suite',
    icon: iconPath,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#111214',
      symbolColor: '#dbdee1',
      height: 60
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Важно для локальных ресурсов
      autoHideMenuBar: true
    }
  });

  if (fs.existsSync(iconPath)) {
    win.setIcon(iconPath);
  }

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
