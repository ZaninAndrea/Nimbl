const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { exec } = require('child_process');
const {ipcMain, shell} = require('electron')
const generatePreview = require("./generatePreview.js")
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let previewCache={} // cache of link previews used in the markdown preview

ipcMain.on('gitFlow', (event, arg) => {
    // exec(`cd ${arg[0]} | git add . ; git commit -m "changed file ${arg[1]}" ; git push`, (error, stdout, stderr) => {
    //   if (error) {
    //     event.sender.send('asynchronous-reply', `exec error: ${error}`)
    //     console.error(`exec error: ${error}`);
    //     return;
    //   }
    //   event.sender.send('asynchronous-reply', `stdout: ${stdout}`, `stderr: ${stderr}`)
    // });
    event.sender.send('gitFlow-reply', "WORK IN PROGRESS")
})

const insertInPreviewCache = url => sender => preview => {
    previewCache[url] = preview // caches the preview
    sender.send("linkPreviewReady") // notifies the react app that the preview is ready
}

// handle link preview creation
ipcMain.on("linkPreview", (event, arg) => {
    if (previewCache.hasOwnProperty(arg)){
        event.returnValue = previewCache[arg] // returns the cached preview
    } else {
        generatePreview(arg, insertInPreviewCache(arg)(event.sender) ) // asynchronous preview creation
        event.returnValue = arg // while the preview is being create display just the link
    }
})

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 900, height: 680});
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`); // load the react app
  mainWindow.on('closed', () => mainWindow = null);

  // intercept link opening
  mainWindow.webContents.on('new-window', function(event, url){
      event.preventDefault();
      shell.openExternal(url); //open url with default browser
  });
}

app.on('ready', createWindow);

// on MacOS leave process running also with no windows
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// if there are no windows create one
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
