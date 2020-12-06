const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Import fs and path to read and write files like save data.
// This application has the root directory '/' as
// the root directory of this app, not the entire computer
contextBridge.exposeInMainWorld('path', path);
contextBridge.exposeInMainWorld('fs', fs);
/*
Sample use:
window.fs.readFile(window.path.join('src', 'css', 'App.css'), (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
*/

// Parse the application path from the process.
const appPathRaw = process.argv[6];

// Remove everything up to '='
let appPath = appPathRaw.slice(appPathRaw.indexOf('=') + 1, appPathRaw.length);

// If the path ends at 'uncontained', add 'src', because it is then in development.
if (path.basename(appPath) === 'uncontained')
  appPath = path.join(appPath, 'src');
// Otherwise, just add the directory.
else appPath = path.dirname(appPath);

// Although appPath.appPath is redundant, there is no way to attach a
// string to the parameter. It requires an object, and so I have opted for
// redundancy as opposed to complication (why name it anything else?).
contextBridge.exposeInMainWorld('appPath', { appPath: appPath });

contextBridge.exposeInMainWorld('api', {
  request: (channel, data) => {
    let validChannels = ['request-userdata-dir'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  response: (channel, func) => {
    let validChannels = ['send-userdata-dir'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
})