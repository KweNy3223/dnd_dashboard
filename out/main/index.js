"use strict";
const { app, BrowserWindow } = require("electron");
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile("src/renderer/index.html");
  }
  win.webContents.openDevTools();
}
app.whenReady().then(createWindow);
