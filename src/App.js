import React, {Component} from 'react';
import PanelGroup from "react-panelgroup";
import mime from "mime"
import MDEditorPreview from "./components/MDEditorPreview.js"
import Tree from "./components/Tree.js"
import buildTree from "./utilities/buildTree.js"
import buildSite from "./utilities/buildSite.js"
import "./stylesheets/font-awesome/css/font-awesome.min.css"
import "./stylesheets/katex/katex.min.css"
import "./stylesheets/bootstrap/css/bootstrap.min.css"
import "./stylesheets/github-markdown/github-markdown.css"
import "source-code-pro/source-code-pro.css"
import './stylesheets/App.css';
import './stylesheets/Tree.css';
import './stylesheets/MDEditorPreview.css';
import './stylesheets/highlight.css';
import './stylesheets/customMD.css';
import {Button, Radio, Checkbox} from 'antd';
const ButtonGroup = Button.Group;

const electron = window.require('electron'); // little trick to import electron in react
const fs = electron.remote.require('fs');
const dialog = electron.remote.dialog
const ipcRenderer = electron.ipcRenderer;


class App extends Component {
    constructor(props) {
        super(props);

        // default values
        const dir = ""
        const file = ""
        const tree = {
            dir: dir,
            files: [],
            subfolders: []
        }
        const value = ""
        const unsavedChanges = false
        const addedChanges = false
        const watcher = null
        const preview = true
        const sidebar = true

        // binding all the functions
        this.handleChange = this.handleChange.bind(this)
        this.handleDirChange = this.handleDirChange.bind(this)
        this.handleTreeSelect = this.handleTreeSelect.bind(this)
        this.handleSave = this.handleSave.bind(this)
        this.handleOpenDir = this.handleOpenDir.bind(this)
        this.handleCommit = this.handleCommit.bind(this)
        this.handleSiteBuild = this.handleSiteBuild.bind(this)
        this.handleSidebarToggle = this.handleSidebarToggle.bind(this)
        this.handlePreviewToggle = this.handlePreviewToggle.bind(this)

        this.state = {
            value,
            file,
            tree,
            dir,
            watcher,
            unsavedChanges,
            addedChanges,
            preview,
            sidebar
        };

        // refresh when receiving notification of a fetched linkPreview
        const handlePreview = (event) => {this.forceUpdate()}
        handlePreview.bind(this)
        ipcRenderer.on("linkPreviewReady", handlePreview)
    }

    handleChange(newValue) {
        this.setState({value: newValue, unsavedChanges: true}); // handle editor changes
    }

    handleDirChange(event, filename) {
        if (event === "rename") { // if the directory tree changed
            this.setState((prevState, props) => { // rebuild the directory tree
                return {
                    tree: buildTree(prevState.dir)
                };
            })
        }
    }

    handleTreeSelect(node, data) {
        if (node.length !== 0) {
            // nesting ifs so that statSync doesn't get called with undefined as argument
            if (!fs.statSync(node[0]).isDirectory() && node[0] !== this.state.file) { // if a new file is selected
                let value = mime.lookup(node[0]) === "text/x-markdown"
                    ? fs.readFileSync(node[0]).toString() // markdown file --> read the file to an ascii string
                    : mime.lookup(node[0]).startsWith("image")
                    ? "data:" + mime.lookup(node[0]) + ";base64," + fs.readFileSync(node[0]).toString("base64") // image --> read the image to a base64 string
                    : ""

                this.setState({value: value, file: node[0]})
            }
        }
    }

    handleSave() {
        let callback = (err) => {
            if (err)
                throw err;
            this.setState({unsavedChanges: false})
        }
        callback = callback.bind(this)
        fs.writeFile(this.state.file, this.state.value, callback);
    }

    handleOpenDir() {
        dialog.showOpenDialog({
            title: "Open a notebook",
            properties: ['openDirectory']
        }, folders => {
            if (!folders) { // if no folder selected
                return
            }
            if (this.state.watcher !== null) { // stop tracking changes in the previous directory
                this.state.watcher.close()
            }

            this.setState({
                dir: folders[0],
                tree: buildTree(folders[0]),
                file: "",
                value: "",
                unsavedChanges: false,
                watcher: fs.watch(folders[0], {
                    recursive: true
                }, this.handleDirChange)
            })
        })
    }

    handleCommit(){
        // still to implement
        ipcRenderer.on('gitFlow-reply', (event, arg) => {
            console.log(arg)
        })
        ipcRenderer.send('gitFlow', this.state.dir, this.state.file)
    }

    handleSiteBuild(){
        buildSite(this.state.dir)
    }

    handleSidebarToggle(){
        this.setState((oldState, props) => ({sidebar:!oldState.sidebar}))
    }

    handlePreviewToggle(){
        this.setState((oldState, props) => ({preview:!oldState.preview}))
    }

    render() {
        // selected the correct editor / preview for the current file
        let editor = mime.lookup(this.state.file) === "text/x-markdown"
            ? <MDEditorPreview value={this.state.value} handleChange={this.handleChange} preview={this.state.preview}/>
            : mime.lookup(this.state.file).startsWith("image")
            ? <div className="imagePreview">
                <div className="imageContainer">
                    <img className="img-responsive" src={this.state.value}/>
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
                        <Button type={this.state.unsavedChanges ? "primary" : ""} onClick={this.handleSave} disabled={this.state.file === ""}>
                            <i className="fa fa-floppy-o" aria-hidden="true"></i>
                        </Button>
                        <Button type={this.state.addedChanges ? "primary" : ""} onClick={this.handleCommit}>
                            <i className="fa fa-arrow-up" aria-hidden="true"></i>
                        </Button>
                    </ButtonGroup>
                    <Button onClick={this.handleSiteBuild} disabled={this.state.dir === ""}>
                        <i className="fa fa-paper-plane" aria-hidden="true"></i>
                    </Button>
                    <Checkbox checked={this.state.sidebar} onClick={this.handleSidebarToggle}>
                        sidebar
                    </Checkbox>
                    <Checkbox checked={this.state.preview} onClick={this.handlePreviewToggle}>
                        preview
                    </Checkbox>
                </div>

                <div className="AppBody">
                    <PanelGroup borderColor="grey" panelWidths={[
                        {size: 150, minSize:100}
                    ]}>
                        {this.state.sidebar ? <Tree tree={this.state.tree} onSelect={this.handleTreeSelect}/> : null}
                        {editor}
                    </PanelGroup>
                </div>
            </div>
        );
    }
}

export default App;
