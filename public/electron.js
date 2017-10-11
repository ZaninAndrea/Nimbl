const {
    app,
    BrowserWindow,
    Menu,
    protocol,
    ipcMain,
    dialog,
    shell,
} = require("electron")
const {autoUpdater} = require("electron-updater")
const {exec} = require("child_process")
const generatePreview = require("./generatePreview.js")
const path = require("path")
const url = require("url")
const isDev = require("electron-is-dev")
const isAbsoluteUrl = require("is-absolute-url")
let mainWindow
let previewCache = {} // cache of link previews used in the markdown preview

ipcMain.on("gitPush", (event, dir) => {
    // pull
    exec("git pull", {cwd: dir}, (err0, stdout0, stderr0) => {
        if (err0) {
            console.log(err0, stderr0, "pull")

            event.sender.send("gitPush-err", stderr0 ? stderr0 : stdout0)
            return
        }

        // add
        exec("git add .", {cwd: dir}, (err1, stdout1, stderr1) => {
            if (err1) {
                console.log(err1, stderr1, "add")
                event.sender.send("gitPush-err", stderr1 ? stderr1 : stdout1)
                return
            }
            // commit
            exec(
                'git commit -m "updated with Nimbl"',
                {cwd: dir},
                (err2, stdout2, stderr2) => {
                    if (err2) {
                        console.log(err2, stderr2, "commit")

                        event.sender.send(
                            "gitPush-err",
                            stderr2 ? stderr2 : stdout2
                        )
                        return
                    }
                    // push
                    exec(
                        "git push origin master",
                        {cwd: dir},
                        (err3, stdout3, stderr3) => {
                            if (err3) {
                                console.log(err3, stderr3, "push")

                                event.sender.send(
                                    "gitPush-err",
                                    stderr3 ? stderr3 : stdout3
                                )
                                return
                            }

                            event.sender.send("gitPush-success")
                        }
                    )
                }
            )
        })
    })
})

ipcMain.on("gitPull", (event, dir) => {
    // pull
    exec("git pull", {cwd: dir}, (err0, stdout0, stderr0) => {
        if (err0) {
            console.log(err0, stderr0, "pull")

            event.sender.send("gitPull-err", stderr0 ? stderr0 : stdout0)
            return
        }

        event.sender.send("gitPull-success")
    })
})

const insertInPreviewCache = url => sender => preview => {
    previewCache[url] = preview // caches the preview
    sender.send("linkPreviewReady") // notifies the react app that the preview is ready
}

// handle link preview creation
ipcMain.on("linkPreview", (event, arg) => {
    if (previewCache.hasOwnProperty(arg)) {
        event.returnValue = previewCache[arg] // returns the cached preview
    } else {
        generatePreview(arg, insertInPreviewCache(arg)(event.sender)) // asynchronous preview creation
        event.returnValue = arg // while the preview is being create display just the link
    }
})

ipcMain.on("mainClose", (event, arg) => {
    mainWindow.destroy()
})

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        icon: `${path.join(__dirname, "../build/icon.ico")}`,
        backgroundColor: "#002b36",
    })
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    ) // load the react app
    if (isDev) mainWindow.openDevTools()
    mainWindow.on("closed", () => (mainWindow = null))

    // intercept link opening
    mainWindow.webContents.on("new-window", function(event, url) {
        event.preventDefault()
        if (isAbsoluteUrl(url)) {
            shell.openExternal(url) //open url with default browser
        } else {
            ipcMain.send("changeFile", url)
        }
    })

    if (isDev) {
        const {
            default: installExtension,
            REACT_DEVELOPER_TOOLS,
        } = require("electron-devtools-installer")
        // installing react dev tools
        installExtension(REACT_DEVELOPER_TOOLS)
            .then(name => console.log(`Added Extension:  ${name}`))
            .catch(err => console.log("An error occurred: ", err))
    }

    autoUpdater.checkForUpdates()
}

app.on("ready", createWindow)

autoUpdater.on("update-downloaded", info => {
    mainWindow.webContents.send("updateReady")
})
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall()
})

// on MacOS leave process running also with no windows
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

// if there are no windows create one
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow()
    }
})
