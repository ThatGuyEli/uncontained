const { contextBridge } = require('electron');

// fs and path to read and write files like save data
// this application has the root directory '/' as
// the root directory of this app, not the entire computer
contextBridge.exposeInMainWorld('fs', require('fs'));
contextBridge.exposeInMainWorld('path', require('path'));
/*
Sample use:
window.fs.readFile(window.path.join('src', 'css', 'App.css'), (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
*/