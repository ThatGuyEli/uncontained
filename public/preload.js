const { contextBridge } = require('electron');

// fs and path to read and write files like save data
// this application has the root directory '/' as
// the root directory of this app, not the entire computer
contextBridge.exposeInMainWorld('fs', require('fs'));
contextBridge.exposeInMainWorld('path', require('path'));

// Although appPath.appPath is redundant, there is no way to attach purely a
// string to the parameter. It requires an object, and so I have opted for
// redundancy as opposed to complication (why name it anything else?).
const argv = window.process.argv;
contextBridge.exposeInMainWorld('appPath', { appPath: argv[argv.length - 1]});
/*
Sample use:
window.fs.readFile(window.path.join('src', 'css', 'App.css'), (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
*/
