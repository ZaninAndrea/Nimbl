import React, {Component} from 'react'
import PanelGroup from "react-panelgroup"
import mime from "mime"
import path from "path"
import Mousetrap from "mousetrap"
import uslug from "uslug"
import MDEditorPreview from "./components/MDEditorPreview.js"
import Settings from "./components/Settings.js"
import DirTree from "./components/DirTree.js"
import buildTree from "./utilities/buildTree.js"
import buildSite from "./utilities/buildSite.js"
import {buildDirTree, replaceInTree} from "./utilities/treeUtils"
import newMd from "./utilities/markdown-it-conf"
import Tabs from "react-draggable-tabs"
import {Button, Radio, Checkbox, Slider, InputNumber, Select} from 'antd'
import "source-code-pro/source-code-pro.css"
import './stylesheets/css/App.css'

const { Option, OptGroup } = Select
const ButtonGroup = Button.Group

const electron = window.require('electron') // little trick to import electron in react
const fs = electron.remote.require('fs')
const dialog = electron.remote.dialog
const ipcRenderer = electron.ipcRenderer
const Store = electron.remote.require('electron-store')
const store = new Store()

class App extends Component {
    constructor(props) {
        super(props)
        // binding all the functions
        this.handleChange = this.handleChange.bind(this)
        // this.handleDirChange = this.handleDirChange.bind(this)
        this.handleTreeSelect = this.handleTreeSelect.bind(this)
        this.handleSave = this.handleSave.bind(this)
        this.handleOpenDir = this.handleOpenDir.bind(this)
        this.handleCommit = this.handleCommit.bind(this)
        this.handleSiteBuild = this.handleSiteBuild.bind(this)
        this.handleSidebarToggle = this.handleSidebarToggle.bind(this)
        this.handleShowPreviewToggle = this.handleShowPreviewToggle.bind(this)
        this.renderMd = this.renderMd.bind(this)
        this.handleRefreshRateChange = this.handleRefreshRateChange.bind(this)
        this.handleThemeChange = this.handleThemeChange.bind(this)
        this.handleTreeLoadData = this.handleTreeLoadData.bind(this)
        this.handleSaveShortcut = this.handleSaveShortcut.bind(this)
        this.handleSidebarResize = this.handleSidebarResize.bind(this)
        this.handleSettingsToggle = this.handleSettingsToggle.bind(this)
        this.handleSettingsModalClose = this.handleSettingsModalClose.bind(this)
        this.handleMdSettingsChange = this.handleMdSettingsChange.bind(this)
        this.onFileDrop = this.onFileDrop.bind(this)
        this.handleTreeExpand = this.handleTreeExpand.bind(this)
        this.handleTabSelect = this.handleTabSelect.bind(this)
        this.handleMoveTab = this.handleMoveTab.bind(this)
        this.handleClosedTab = this.handleClosedTab.bind(this)
        this.handleAdvancedSettingsToggle = this.handleAdvancedSettingsToggle.bind(this)
        this.handleMDModeChange = this.handleMDModeChange.bind(this)
        // default values
        const storeSettings = store.get("settings")
        let settings
        if (storeSettings){
            settings = storeSettings
        }
        else {
            settings = {
               showPreview : true,
               showSidebar : true,
               refreshRate : 500,
               editorTheme : "solarized_dark",
               sidebarWidth : 100,
               mdSettings: {
                   isPreview:true,
                   html: true,
                   linkify:false,
                   typographer: false,
                   breaks: true,
                   checkbox: true,
                   anchor: true,
                   toc:true,
                   tocLevels: [1,2,3,4],
                   katex:true,
                   smartarrows:true,
                   alert: true,
                   note: true,
                   spoiler: true,
                   url: true,
                   video: true,
                   graph: true,
               }
           }

           store.set("settings", settings)
        }

        this.state = {
            app: {
                dir : "",
                file : [],
                tree : {
                    key: "",
                    position: [],
                    name: "",
                    children: []
                },
                value : [],
                preview : [],
                tabs:[],
                unsavedChanges : false,
                addedChanges : false,
                watcher : null,
                renderTimeout : null,
                currentFileIndex:0,
                settingsModalOpen: false,
                treeExpandedKeys: [],
                showAdvancedSettings: false
            },
            settings: settings
        }

        Mousetrap.bind("ctrl+s", this.handleSaveShortcut)


        // refresh when receiving notification of a fetched linkPreview
        const handlePreviewReady = (event) => {this.renderMd()}
        handlePreviewReady.bind(this)
        ipcRenderer.on("linkPreviewReady", handlePreviewReady)

        // setting up markdown renderer
        this.md = newMd(settings.mdSettings, this.state.app.dir)

    }

    // handle CTRL+S shortcut
    handleSaveShortcut(){
        this.handleSave()
        return false // prevent event from bubbling up
    }

    renderMd(){
        this.setState((oldState, props) => {
            let newApp = {...oldState.app}
            newApp.preview[oldState.app.currentFileIndex] = this.md.render(oldState.app.value[oldState.app.currentFileIndex])
            return {app:newApp}
        })
    }

    // handles changes in the editor content, aka user writing
    handleChange(newCurrValue) { // update editor continuously, update preview only after `refreshRate` milliseconds of idle
        clearTimeout(this.state.app.renderTimeout) // delay update
        const newTimeout = this.state.settings.showPreview ? setTimeout(this.renderMd, this.state.settings.refreshRate) : null
        this.setState((oldState, props) => { // handle editor changes
            let newValue = oldState.app.value
            newValue[oldState.app.currentFileIndex]=newCurrValue
            let newApp = {...oldState.app, ...{
                value: newValue,
                renderTimeout: newTimeout,
                unsavedChanges: true
            } }
            return {app:newApp}
        })
    }

    // handleDirChange(event, filename) {
    //     if (event === "rename") { // if the directory tree changed
    //         this.setState((oldState, props) => {
    //             let newApp = {...oldState.app}
    //             newApp.tree = buildTree(oldState.app.dir) // rebuild the directory tree
    //             return {app:newApp}
    //         })
    //     }
    // }

    handleTreeSelect(node, data) { // handles clicks in the sidebar
        if (node.length !== 0) {
            // nesting ifs so that statSync doesn't get called with undefined as argument
            if (!fs.statSync(node[0]).isDirectory() && !this.state.app.file.includes(node[0])) { // if a new file is selected
                this.setState((oldState, props) => {
                    const mimeLookup = mime.lookup(node[0])
                    let currValue = mimeLookup === "text/x-markdown" || mimeLookup === "text/markdown"
                        ? fs.readFileSync(node[0]).toString() // markdown file --> read the file to an ascii string
                        : mimeLookup.startsWith("image")
                        ? "data:" + mimeLookup + ";base64," + fs.readFileSync(node[0]).toString("base64") // image --> read the image to a base64 string
                        : ""

                    let newFile = oldState.app.file
                    newFile.push(node[0])

                    let newValue = oldState.app.value
                    newValue.push(currValue)

                    let preview = oldState.app.preview
                    preview.push( mimeLookup === "text/x-markdown" || mimeLookup === "text/markdown" && this.state.settings.showPreview
                        ? this.md.render(currValue)
                        : "")

                    let tabs = oldState.app.tabs
                    tabs.push(newFile.length -1) // add the index of the new file to the tabs

                    const newApp = {...oldState.app, ...{value: newValue, file: newFile, preview:preview, currentFileIndex: newFile.length -1, tabs: tabs} }
                    return {app:newApp}
                })
            } else if (!fs.statSync(node[0]).isDirectory() && this.state.app.file.includes(node[0])) { // file already open is selected
                this.setState((oldState, props) => {
                    const newApp = {...oldState.app, ...{currentFileIndex: oldState.app.file.indexOf(node[0])} }
                    return {app:newApp}
                })
            }
        }
    }

    handleSave() { // handles saving the current file
        let callback = (err) => {
            if (err)
                throw err

            this.setState((oldState, props) => {
                let newApp = {...oldState.app}
                newApp.unsavedChanges = false // rebuild the directory tree
                return {app:newApp}
            })
        }
        callback = callback.bind(this)
        fs.writeFile(this.state.app.file[this.state.app.currentFileIndex], this.state.app.value[this.state.app.currentFileIndex], callback)
    }

    handleOpenDir() { // handles opening a directory
        dialog.showOpenDialog({
            title: "Open a notebook",
            properties: ['openDirectory']
        }, folders => {
            if (!folders) { // if no folder selected
                return
            }
            if (this.state.app.watcher !== null) { // stop tracking changes in the previous directory
                this.state.app.watcher.close()
            }

            this.setState((oldState, props) => {
                let newApp = {...oldState.app, ...{
                    dir: folders[0],
                    tree: buildDirTree(folders[0],[]),
                    file: [],
                    value: [],
                    preview:[],
                    unsavedChanges: false,
                    watcher: fs.watch(folders[0], {
                        recursive: true
                    }, this.handleDirChange)
                } }
                let newSettings = {...oldState.settings, ...{
                    showSidebar: true
                }}
                this.md = newMd(newSettings.mdSettings, newApp.dir) // update md renderer
                return {app:newApp, settings: newSettings}
            })
        })
    }

    handleCommit(){
        // to do
    }

    handleSiteBuild(){
        buildSite(this.state.app.dir, this.state.settings.mdSettings)
    }

    handleSidebarToggle(){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.showSidebar = !oldState.settings.showSidebar
            store.set("settings.showSidebar", newSettings.showSidebar)
            return {settings:newSettings}
        })
    }

    handleShowPreviewToggle(){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.showPreview = !oldState.settings.showPreview
            store.set("settings.showPreview", newSettings.showPreview)

            if (newSettings.showPreview){ // if preview enable, render markdown
                let newApp = {...oldState.app}
                const mimeLookup = mime.lookup(oldState.app.file[oldState.app.currentFileIndex])
                newApp.preview[oldState.app.currentFileIndex] = mimeLookup === "text/x-markdown" || mimeLookup === "text/markdown"
                    ? this.md.render(oldState.app.value[oldState.app.currentFileIndex])
                    : ""
                return {settings:newSettings, app:newApp}
            }

            return {settings:newSettings}
        })

    }

    handleRefreshRateChange(newVal){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.refreshRate = newVal*1000
            store.set("settings.refreshRate", newSettings.refreshRate)
            return {settings:newSettings}
        })
    }

    handleThemeChange(newVal){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.editorTheme = newVal
            store.set("settings.editorTheme", newSettings.editorTheme)
            return {settings:newSettings}
        })
    }

    handleTreeLoadData(treeNode){ // handles directory exploration when expanding a folder in the sidebar tree
      return new Promise((resolve) => {
          const treeData = this.state.app.tree // loads old tree
          const newSubTree = buildDirTree(treeNode.props.eventKey,treeNode.props.position) // creates the new subTree
          replaceInTree(treeData, newSubTree, treeNode.props.position) // inserts the new subtree in the right position
          this.setState((oldState, props) => {
              let newApp = {...oldState.app}
              newApp.tree = treeData
              return {app:newApp}
          })
          resolve()
      })
    }

    handleSidebarResize(sizes){
        if (sizes.length>1 && sizes[0].size !== this.state.settings.sidebarWidth){
            this.setState((oldState, props) => {
                let newSettings = {...oldState.settings}
                newSettings.sidebarWidth = sizes[0].size
                store.set("settings.sidebarWidth", newSettings.sidebarWidth)
                return {settings:newSettings}
            })
        }
    }

    handleSettingsToggle() {
        this.setState((oldState, props) => {
            let newApp = {...oldState.app}
            newApp.settingsModalOpen = true
            return {app:newApp}
        })
    }

    handleSettingsModalClose(){
        this.setState((oldState, props) => {
            let newApp = {...oldState.app}
            newApp.settingsModalOpen = false
            this.md = newMd(this.state.settings.mdSettings, newApp.dir) // update md renderer

            const mimeLookup = mime.lookup(oldState.app.file[oldState.app.currentFileIndex])
            newApp.preview[oldState.app.currentFileIndex] = mimeLookup === "text/x-markdown" || mimeLookup === "text/markdown"
                ? this.md.render(oldState.app.value[oldState.app.currentFileIndex])
                : ""
            return {app:newApp}
        })
    }

    handleMdSettingsChange(prop, newValue){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.mdSettings[prop] = newValue
            store.set("settings.mdSettings."+prop, newValue)
            return {settings:newSettings}
        })
    }

    onFileDrop(files, position){
        // copy files in the working directory
        if (!fs.existsSync(path.join(this.state.app.dir,"images"))) { // if output directory does not exist, create it
            fs.mkdirSync(path.join(this.state.app.dir,"images"))
        }
        for (let i in files){
            const dest = path.join(this.state.app.dir,"images", uslug(files[i].name, { allowedChars: '.' }))
            const data = fs.readFileSync(files[i].path)
            fs.writeFileSync(dest, data)
        }

        // update markdown
        let index = 0

        // consume rows
        let currentRow = 0
        while(currentRow<position.row){
            if(this.state.app.value[this.state.app.currentFileIndex][index]=="\n"){
                currentRow++
            }
            index++
        }

        // jump to correct position
        index += position.column
        var newValue =  this.state.app.value[this.state.app.currentFileIndex].slice(0, index) +
                        files.reduce((acc,x)=>`${acc}![${x.name}](${path.join(".","images", uslug(x.name, { allowedChars: '.' }))})\n`,"") +
                        this.state.app.value[this.state.app.currentFileIndex].slice(index)

        this.setState((oldState, props) => {
            let newApp = {...oldState.app}
            newApp.value[newApp.currentFileIndex] = newValue
            newApp.preview[newApp.currentFileIndex] = this.md.render(newValue)
            return {app:newApp}
        })

    }

    handleTreeExpand(expandedKeys) {
        console.log("expand", expandedKeys)
        this.setState((oldState, props) => {
            let newApp = {...oldState.app}
            newApp.treeExpandedKeys = expandedKeys
            return {app:newApp}
        })
    }

    handleTabSelect(selectedIndex, selectedId) {
        console.log("select")
        this.setState((state, props) => {
            let newApp = {...state.app}
            newApp.currentFileIndex = selectedId

            return {app:newApp}
        })
    }

    handleMoveTab(dragIndex, hoverIndex) {
        this.setState((state, props) => {
            let newApp = {...state.app}
            newApp.tabs.splice(hoverIndex, 0, newApp.tabs.splice(dragIndex, 1)[0]);

            return {app:newApp}
        })
    }

    handleClosedTab(removedIndex, removedID) {
        this.setState((state, props) => {
            let newApp = {...state.app}

            // create safe copies
            newApp.tabs = [...newApp.tabs]
            newApp.file = [...newApp.file]
            newApp.preview = [...newApp.preview]
            newApp.value = [...newApp.value]

            newApp.tabs.splice(removedIndex, 1) // remove the item
            newApp.file.splice(removedID, 1)
            newApp.preview.splice(removedID, 1)
            newApp.value.splice(removedID, 1)

            if (state.app.currentFileIndex === removedID && newApp.tabs.length !== 0) { // automatically select another tab if needed
                const newActive = removedIndex === 0
                    ? state.app.tabs[0]
                    : state.app.tabs[removedIndex - 1]

                newApp.currentFileIndex = newActive;
            }

            newApp.tabs = newApp.tabs.map(tab => tab < removedID ? tab : tab -1) // update the indexes
            newApp.currentFileIndex = newApp.currentFileIndex < removedID ? newApp.currentFileIndex : newApp.currentFileIndex - 1;

            return {app:newApp}
        })
    }

    handleAdvancedSettingsToggle() {
        this.setState((state, props) => {
            let newApp = {...state.app}
            newApp.showAdvancedSettings = !newApp.showAdvancedSettings

            return {app:newApp}
        })
    }

    handleMDModeChange(update){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.mdSettings = {...newSettings.mdSettings, ...update}
            store.set("settings.mdSettings", newSettings.mdSettings)
            return {settings:newSettings}
        })
    }

    render() {
        let editor
        if (this.state.app.file.length > 0){ // if there are files selected
            // selected the correct editor / preview for the current file
            const lookup = mime.lookup(this.state.app.file[this.state.app.currentFileIndex])
            editor = lookup === "text/x-markdown" || lookup === "text/markdown"
                ? <MDEditorPreview handleSave={this.handleSaveShortcut}
                                    theme={this.state.settings.editorTheme}
                                    value={this.state.app.value[this.state.app.currentFileIndex]}
                                    handleChange={this.handleChange} preview={this.state.app.preview[this.state.app.currentFileIndex]}
                                    showPreview={this.state.settings.showPreview}
                                    currentDir={this.state.app.dir}
                                    onDrop={this.onFileDrop}/>
                : lookup.startsWith("image")
                ? <div className="imagePreview">
                    <div className="imageContainer">
                        <img className="img-responsive" src={this.state.app.value[this.state.app.currentFileIndex]}/>
                    </div>
                </div>
                : "SELECT A SUPPORTED FILE"

         } else {
             editor = "NO FILE SELECTED"
         }

        let sidebar
        if (this.state.settings.showSidebar){
            sidebar =   <div className="sidebar">
                            <DirTree treeData={this.state.app.tree}
                               dir={this.state.app.dir}
                               onLoadData={this.handleTreeLoadData}
                               onSelect={this.handleTreeSelect}
                               onExpand={this.handleTreeExpand}
                               expandedKeys={this.state.app.treeExpandedKeys}
                               selectedKeys={[]}
                           />
                           <ButtonGroup className="sidebarTypeSwitch">
                            <Button>
                              Simple
                            </Button>
                            <Button>
                              Advanced
                            </Button>
                          </ButtonGroup>
                       </div>
        }else{
            sidebar = null
        }
        return (
            <div className="App">
                <Settings   visible = {this.state.app.settingsModalOpen}
                            settings = {this.state.settings}
                            handleSidebarToggle={this.handleSidebarToggle}
                            handleShowPreviewToggle={this.handleShowPreviewToggle}
                            handleRefreshRateChange={this.handleRefreshRateChange}
                            handleThemeChange={this.handleThemeChange}
                            handleSettingsModalClose={this.handleSettingsModalClose}
                            handleMdSettingsChange={this.handleMdSettingsChange}
                            handleMDModeChange={this.handleMDModeChange}
                            showAdvancedSettings={this.state.app.showAdvancedSettings}
                            toggleAdvancedSettings={this.handleAdvancedSettingsToggle}/>
                <div className="AppBody">
                    <PanelGroup borderColor="#586e75" panelWidths={[
                        {size: this.state.settings.sidebarWidth, minSize:100}
                    ]} onUpdate={this.handleSidebarResize} >
                        {sidebar}

                        <div className="mainEditor">
                        <Tabs
                            selectTab={this.handleTabSelect}
                            closeTab={this.handleClosedTab}
                            moveTab={this.handleMoveTab}
                            tabs={this.state.app.tabs.map(id => ({content: path.basename(this.state.app.file[id]), id: id, active: id === this.state.app.currentFileIndex}))}
                            >
                                <ButtonGroup size="large">
                                    <Button onClick={this.handleOpenDir}>
                                        <i className="fa fa-folder-open" aria-hidden="true"></i>
                                    </Button>
                                    <Button type={this.state.app.unsavedChanges ? "primary" : ""} onClick={this.handleSave} disabled={this.state.app.file[0] === ""}>
                                        <i className="fa fa-floppy-o" aria-hidden="true"></i>
                                    </Button>
                                    <Button type={this.state.app.addedChanges ? "primary" : ""} onClick={this.handleCommit}>
                                        <i className="fa fa-arrow-up" aria-hidden="true"></i>
                                    </Button>
                                    <Button onClick={this.handleSiteBuild} disabled={this.state.app.dir === ""}>
                                        <i className="fa fa-paper-plane" aria-hidden="true"></i>
                                    </Button>
                                </ButtonGroup>
                                <Button onClick={this.handleSettingsToggle}>
                                    <i className="fa fa-cog" aria-hidden="true"></i>
                                </Button>
                            </Tabs>
                            <div style={{width:"100%", height:"100%"}}>{editor}</div>
                        </div>

                    </PanelGroup>
                </div>
            </div>
        )
    }
}

export default App
