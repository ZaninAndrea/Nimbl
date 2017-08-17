import React, {Component} from 'react';
import PanelGroup from "react-panelgroup";
import mime from "mime"
import path from "path"
import Mousetrap from "mousetrap"
import MDEditorPreview from "./components/MDEditorPreview.js"
import DirTree from "./components/DirTree.js"
import buildTree from "./utilities/buildTree.js"
import buildSite from "./utilities/buildSite.js"
import {buildDirTree, replaceInTree} from "./utilities/treeUtils"
import md from "./utilities/markdown-it-conf"
import "./stylesheets/font-awesome/css/font-awesome.min.css"
import "./stylesheets/katex/katex.min.css"
import "./stylesheets/bootstrap/css/bootstrap.min.css"
import "./stylesheets/github-markdown/github-markdown.css"
import "source-code-pro/source-code-pro.css"
import './stylesheets/App.css'
import './stylesheets/Tree.css'
import './stylesheets/MDEditorPreview.css'
import './stylesheets/highlight.css'
import './stylesheets/customMD.css'
import {Button, Radio, Checkbox, Slider, InputNumber, Select} from 'antd';
const { Option, OptGroup } = Select;
const ButtonGroup = Button.Group;

const electron = window.require('electron'); // little trick to import electron in react
const fs = electron.remote.require('fs');
const dialog = electron.remote.dialog
const ipcRenderer = electron.ipcRenderer;


class App extends Component {
    constructor(props) {
        super(props);
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
        // default values
        this.state = {
            app: {
                dir : "",
                file : "",
                tree : {
                    key: "",
                    position: [],
                    name: "",
                    children: []
                },
                value : "",
                preview : "",
                unsavedChanges : false,
                addedChanges : false,
                watcher : null,
                renderTimeout : null,
            },
            settings: {
                showPreview : true,
                showSidebar : true,
                refreshRate : 500,
                editorTheme : "solarized_dark"
            }
        };

        Mousetrap.bind("ctrl+s", this.handleSaveShortcut);


        // refresh when receiving notification of a fetched linkPreview
        const handlePreviewReady = (event) => {this.renderMd()}
        handlePreviewReady.bind(this)
        ipcRenderer.on("linkPreviewReady", handlePreviewReady)
    }

    // handle CTRL+S shortcut
    handleSaveShortcut(){
        this.handleSave()
        return false; // prevent event from bubbling up
    }

    renderMd(){
        this.setState((oldState, props) => {
            let newApp = {...oldState.app}
            newApp.preview = md.render(oldState.app.value)
            return {app:newApp}
        })
    }

    handleChange(newValue) { // update editor continuously, update preview only after `refreshRate` milliseconds of idle
        clearTimeout(this.state.app.renderTimeout) // delay update
        const newTimeout = this.state.settings.showPreview ? setTimeout(this.renderMd, this.state.settings.refreshRate) : null
        this.setState((oldState, props) => { // handle editor changes
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

    handleTreeSelect(node, data) {
        if (node.length !== 0) {
            // nesting ifs so that statSync doesn't get called with undefined as argument
            if (!fs.statSync(node[0]).isDirectory() && node[0] !== this.state.app.file) { // if a new file is selected
                const mimeLookup = mime.lookup(node[0])
                let value = mimeLookup === "text/x-markdown"
                    ? fs.readFileSync(node[0]).toString() // markdown file --> read the file to an ascii string
                    : mimeLookup.startsWith("image")
                    ? "data:" + mimeLookup + ";base64," + fs.readFileSync(node[0]).toString("base64") // image --> read the image to a base64 string
                    : ""

                // console.log(this.state.settings.showPreview);
                let preview = mimeLookup === "text/x-markdown" && this.state.settings.showPreview
                    ? md.render(value)
                    : ""

                this.setState((oldState, props) => {
                    let newApp = {...oldState.app, ...{value: value, file: node[0], preview:preview} }
                    return {app:newApp}
                })
            }
        }
    }

    handleSave() {
        let callback = (err) => {
            if (err)
                throw err;

            this.setState((oldState, props) => {
                let newApp = {...oldState.app}
                newApp.unsavedChanges = false // rebuild the directory tree
                return {app:newApp}
            })
        }
        callback = callback.bind(this)
        fs.writeFile(this.state.app.file, this.state.app.value, callback);
    }

    handleOpenDir() {
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
                    file: "",
                    value: "",
                    preview:"",
                    unsavedChanges: false,
                    watcher: fs.watch(folders[0], {
                        recursive: true
                    }, this.handleDirChange)
                } }
                return {app:newApp}
            })
        })
    }

    handleCommit(){
        // still to implement
        ipcRenderer.on('gitFlow-reply', (event, arg) => {
            console.log(arg)
        })
        ipcRenderer.send('gitFlow', this.state.app.dir, this.state.app.file)
    }

    handleSiteBuild(){
        buildSite(this.state.app.dir)
    }

    handleSidebarToggle(){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.showSidebar = !oldState.settings.showSidebar
            return {settings:newSettings}
        })
    }

    handleShowPreviewToggle(){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.showPreview = !oldState.settings.showPreview

            if (newSettings.showPreview){ // if preview enable, render markdown
                let newApp = {...oldState.app}
                newApp.preview = md.render(oldState.app.value)
                return {settings:newSettings, app:newApp}
            }

            return {settings:newSettings}
        })

    }

    handleRefreshRateChange(newVal){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.refreshRate = newVal*1000
            return {settings:newSettings}
        })
    }

    handleThemeChange(newVal){
        this.setState((oldState, props) => {
            let newSettings = {...oldState.settings}
            newSettings.editorTheme = newVal
            return {settings:newSettings}
        })
    }

    handleTreeLoadData(treeNode){ // handles directory exploration when expanding a folder in the sidebar tree
      return new Promise((resolve) => {
          const treeData = this.state.app.tree; // loads old tree
          const newSubTree = buildDirTree(treeNode.props.eventKey,treeNode.props.position) // creates the new subTree
          replaceInTree(treeData, newSubTree, treeNode.props.position) // inserts the new subtree in the right position
          this.setState((oldState, props) => {
              let newApp = {...oldState.app}
              newApp.tree = treeData
              return {app:newApp}
          })
          resolve();
      });
    }

    render() {
        // selected the correct editor / preview for the current file
        let editor = mime.lookup(this.state.app.file) === "text/x-markdown"
            ? <MDEditorPreview handleSave={this.handleSaveShortcut} theme={this.state.settings.editorTheme} value={this.state.app.value} handleChange={this.handleChange} preview={this.state.app.preview} showPreview={this.state.settings.showPreview}/>
            : mime.lookup(this.state.app.file).startsWith("image")
            ? <div className="imagePreview">
                <div className="imageContainer">
                    <img className="img-responsive" src={this.state.app.value}/>
                </div>
            </div>
            : "SELECT A SUPPORTED FILE"

        return (
            <div className="App">
                <div className="AppBar">
                    <ButtonGroup size="large">
                        <Button onClick={this.handleOpenDir}>
                            <i className="fa fa-folder-open" aria-hidden="true"></i>
                        </Button>
                        <Button type={this.state.app.unsavedChanges ? "primary" : ""} onClick={this.handleSave} disabled={this.state.app.file === ""}>
                            <i className="fa fa-floppy-o" aria-hidden="true"></i>
                        </Button>
                        <Button type={this.state.app.addedChanges ? "primary" : ""} onClick={this.handleCommit}>
                            <i className="fa fa-arrow-up" aria-hidden="true"></i>
                        </Button>
                    </ButtonGroup>
                    <Button onClick={this.handleSiteBuild} disabled={this.state.app.dir === ""}>
                        <i className="fa fa-paper-plane" aria-hidden="true"></i>
                    </Button>
                    <Checkbox checked={this.state.settings.showSidebar} onClick={this.handleSidebarToggle}>
                        sidebar
                    </Checkbox>
                    <Checkbox checked={this.state.settings.showPreview} onClick={this.handleShowPreviewToggle}>
                        preview
                    </Checkbox>
                    <InputNumber
                        step={0.1}
                       min={0}
                       max={5}
                       style={{ marginLeft: 6 }}
                       value={this.state.settings.refreshRate/1000}
                       onChange={this.handleRefreshRateChange}
                   /> {this.state.settings.refreshRate<500 ? <i className="fa fa-exclamation-triangle" aria-hidden="true"></i> : ""} preview refresh rate &nbsp;&nbsp;
                    <Select
                        defaultValue="solarized_dark"
                        value={this.state.settings.editorTheme}
                        style={{ width: 200 }}
                        onChange={this.handleThemeChange}
                    >
                        <OptGroup label="Dark">
                            <Option value="monokai">Monokai</Option>
                            <Option value="twilight">Twilight</Option>
                            <Option value="terminal">Terminal</Option>
                            <Option value="solarized_dark">Solarized Dark</Option>
                        </OptGroup>
                        <OptGroup label="Light">
                            <Option value="github">Github</Option>
                            <Option value="tomorrow">Tomorrow</Option>
                            <Option value="kuroir">Kuroir</Option>
                            <Option value="xcode">XCode</Option>
                            <Option value="textmate">TextMate</Option>
                            <Option value="solarized_light">Solarized Light</Option>
                        </OptGroup>
                    </Select>
                    theme
                </div>
                <div className="AppBody">
                    <PanelGroup borderColor="grey" panelWidths={[
                        {size: 150, minSize:100}
                    ]}>
                        {this.state.settings.showSidebar ? <DirTree treeData={this.state.app.tree} dir={this.state.app.dir} onLoadData={this.handleTreeLoadData} onSelect={this.handleTreeSelect}/> : null}
                        {editor}
                    </PanelGroup>
                </div>
            </div>
        );
    }
}

export default App;
