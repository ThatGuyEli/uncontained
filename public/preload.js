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

const path = require('path');
//const fs = require('fs');
//const pathArr = window.process.argv[0].split(path.sep);
//const appPathArr = pathArr.slice(0, pathArr.indexOf('uncontained'));
//const test = path.join(...appPathArr);
//console.log(__dirname)
//console.log(test);
////console.log(require('fs').readdir(require('path').join(...appPathArr)));
//
//console.log(argv, __dirname, fs.readdirSync(path.join(__dirname, '..')));

const appPathRaw = process.argv[6];
let appPath = appPathRaw.slice(appPathRaw.indexOf('=') + 1, appPathRaw.length);
if (path.basename(appPath) === 'uncontained') {
  appPath = path.join(appPath, 'src');
}
else {
  appPath = path.dirname(appPath);
}
console.log(appPath);
contextBridge.exposeInMainWorld('appPath', { appPath: appPath });

/*
Sample use:
window.fs.readFile(window.path.join('src', 'css', 'App.css'), (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
*/
