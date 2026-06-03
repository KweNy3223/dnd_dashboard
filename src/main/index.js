const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Важно для локальных ресурсов
    }
  });

  // Определяем путь к файлу
  // В упакованном виде ресурсы лежат в process.resourcesPath
  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, 'out', 'renderer', 'index.html')
    : path.join(__dirname, '../../out/renderer/index.html');

  console.log("Loading file from:", indexPath); // Это поможет нам увидеть путь в консоли
  win.loadFile(indexPath);
  
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});