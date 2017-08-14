const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { exec } = require('child_process');
const {ipcMain} = require('electron')

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

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 900, height: 680});
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
