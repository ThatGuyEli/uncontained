// A majority of this code was taken from Electron's boilerplate guide, on their website.
// https://www.electronjs.org

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      // These are for security; otherwise, this application has full access
      // to node.js's features. We might not want that, because node.js has
      // full access to the filesystem and other vital parts of the system.
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),

      // Pass the app path to window.process.argv. This will allow preload.js
      // to access it, and that script will expose it to the rest of the app.
      additionalArguments: [
        app.getAppPath()
      ]
    },
    // Note: when Electron is running in development, it will throw a warning.
    // This has to do with the Content-Security-Policy, which requires certain
    // code to comply with the developer's specified policy. However, there is
    // no policy because all code is locally run. No remote code is loaded.
  });

  // and load the index.html of the app.
  // Pass the app path as a query.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '..', 'build', 'index.html')}`
  );

  // Open the DevTools.
  if (isDev) mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Create an event so that the user can receive the userData path.
ipcMain.on('request-userdata-dir', (event, arg) => {
  event.reply('send-userdata-dir', app.getPath('userData'));
});

// When the game first launches, make sure that the 'leaderboard' directory
// exists within their userData. If it does not, then create it.
const leaderboardDir = path.join(app.getPath('userData'), 'leaderboard');
fs.readdir(leaderboardDir, (err, files) => {
  if (err.code === 'ENOENT') {
    fs.mkdir(leaderboardDir, { recursive: true }, (err) => {
      if (err) throw err;
    })
  }
})