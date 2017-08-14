import React, {Component} from 'react';
import './stylesheets/App.css';
import './stylesheets/EditorPreview.css';
import './stylesheets/highlight.css';
import "./stylesheets/font-awesome/css/font-awesome.min.css"
import "./stylesheets/katex/katex.min.css"
import "./stylesheets/bootstrap/css/bootstrap.min.css"
import "./stylesheets/github-markdown/github-markdown.css"
import EditorPreview from "./components/EditorPreview.js"
import Tree from "./components/Tree.js"
import "source-code-pro/source-code-pro.css"
import {Button, Radio} from 'antd';
const ButtonGroup = Button.Group;

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const dialog = electron.remote.dialog
const ipcRenderer = electron.ipcRenderer;

const buildTree = dir => {
    let tree = {
        dir: dir,
        files: [],
        subfolders: []
    }

    const list = fs.readdirSync(dir);
    list.forEach(function(element) {
        // Full path of that file
        let path = dir + "/" + element;
        // Get the file's stats
        const stat = fs.statSync(path);
        if (stat && stat.isDirectory() && !path.endsWith(".git"))
            // Dive into the directory
            tree.subfolders.push(buildTree(path));
        else if (!path.endsWith(".git"))
            // Call the action
            tree.files.push(element)
    });

    return tree
}

class App extends Component {
    constructor(props) {
        super(props);
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

        this.handleChange = this.handleChange.bind(this)
        this.handleDirChange = this.handleDirChange.bind(this)
        this.handleTreeSelect = this.handleTreeSelect.bind(this)
        this.handleSave = this.handleSave.bind(this)
        this.handleOpenDir = this.handleOpenDir.bind(this)
        this.handleCommit = this.handleCommit.bind(this)


        this.state = {
            value,
            file,
            tree,
            dir,
            watcher,
            unsavedChanges,
            addedChanges
        };
    }

    handleChange(newValue) {
        this.setState({value: newValue, unsavedChanges: true});
    }

    handleDirChange(event, filename) {
        if (event === "rename") {
            this.setState((prevState, props) => {
                return {
                    tree: buildTree(prevState.dir)
                };
            })
        }
    }

    handleTreeSelect(node, data) {
        console.log(node);
        console.log(data);
        if (node.length !== 0) {
            // nesting ifs so that statSync doesn't get called with undefined as argument
            if (!fs.statSync(node[0]).isDirectory() && node[0] !== this.state.file) {
                const value = fs.readFileSync(node[0]).toString()
                this.setState({value: value, file: node[0]})
            }
        }
    }

    handleSave() {
        let callback = (err) => {
            if (err)
                throw err;
            this.setState({saving: false, unsavedChanges: false})
        }
        callback = callback.bind(this)
        this.setState({saving: true})
        fs.writeFile(this.state.file, this.state.value, callback);
    }

    handleOpenDir() {
        dialog.showOpenDialog({
            title: "Open a notebook",
            properties: ['openDirectory']
        }, folders => {
            if (this.state.watcher !== null) {
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
        ipcRenderer.on('gitFlow-reply', (event, arg) => {
            console.log(arg)
        })
        ipcRenderer.send('gitFlow', this.state.dir, this.state.file)
    }

    render() {
        let editor = this.state.file.endsWith("md")
            ? <EditorPreview value={this.state.value} handleChange={this.handleChange}/>
            : "SELECT A SUPPORTED FILE"

        let saveButton =
        <Button type={this.state.unsavedChanges ? "primary" : ""} onClick={this.handleSave}>
            <i className="fa fa-floppy-o" aria-hidden="true"></i>
        </Button>

        let commitButton =
        <Button type={this.state.addedChanges ? "primary" : ""} onClick={this.handleCommit}>
            <i className="fa fa-arrow-up" aria-hidden="true"></i>

        </Button>

        return (
            <div className="App">
                <div className="AppBar">
                    <ButtonGroup size="large">
                        <Button onClick={this.handleOpenDir}>
                            <i className="fa fa-folder-open" aria-hidden="true"></i>
                        </Button>
                        {saveButton}
                        {commitButton}
                    </ButtonGroup>
                </div>

                <div className="AppBody row">
                    <div className="sidebar col-xs-2">
                        <Tree className="sidebarTree" tree={this.state.tree} onSelect={this.handleTreeSelect}/>
                    </div>
                    <div className="mainEditor col-xs-10">
                        {editor}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
