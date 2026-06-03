const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    });

    if (process.env.ELECTRON_RENDERER_URL) {
  // В режиме разработки подключаемся к серверу Vite
        win.loadURL(process.env.ELECTRON_RENDERER_URL);
}   else {
  // Для финальной сборки загружаем готовый файл
        win.loadFile('src/renderer/index.html');
}
    win.webContents.openDevTools();
} 

app.whenReady().then(createWindow);
