const {app, BrowserWindow, Menu, protocol, ipcMain, dialog, shell} = require('electron');
const {autoUpdater} = require("electron-updater");
const { exec } = require('child_process');
const generatePreview = require("./generatePreview.js")
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const isAbsoluteUrl = require('is-absolute-url');
let mainWindow;
let previewCache={} // cache of link previews used in the markdown preview

ipcMain.on('gitFlow', (event, arg) => {
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

ipcMain.on("mainClose", (event, arg) => {
    mainWindow.destroy()
})


function createWindow() {
  mainWindow = new BrowserWindow({width: 900, height: 680, icon:`${path.join(__dirname, '../build/icon.ico')}`});
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`); // load the react app
  if (isDev) mainWindow.openDevTools();
  mainWindow.on('closed', () => mainWindow = null);

  // intercept link opening
  mainWindow.webContents.on('new-window', function(event, url){
      event.preventDefault();
      if (isAbsoluteUrl(url)){
          shell.openExternal(url); //open url with default browser
      }else{
          ipcMain.send("changeFile", url)
      }
  });

  if (isDev){
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
      // installing react dev tools
      installExtension(REACT_DEVELOPER_TOOLS)
          .then((name) => console.log(`Added Extension:  ${name}`))
          .catch((err) => console.log('An error occurred: ', err));
  }

  autoUpdater.checkForUpdates();

}

app.on('ready', createWindow);

autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('updateReady')
});
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
})

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
