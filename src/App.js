import React, {Component} from 'react';
import './stylesheets/App.css';
import './stylesheets/EditorPreview.css';
import './stylesheets/highlight.css';
import EditorPreview from "./components/EditorPreview.js"
import Tree from "./components/Tree.js"
import {Button, Radio} from 'antd';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
// const ipcRenderer = electron.ipcRenderer;

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
        if (stat && stat.isDirectory())
            // Dive into the directory
            tree.subfolders.push(buildTree(path));
        else
            // Call the action
            tree.files.push(element)
    });

    return tree
}

class App extends Component {
    constructor(props) {
        super(props);
        const dir = "D:\\docs\\reusable"
        const file = "D:\\docs\\reusable\\test.md"
        const tree = buildTree(dir)
        const value = file
            ? fs.readFileSync(file).toString()
            : ""
        const unsavedChanges = false
        const saving = false
        this.handleChange = this.handleChange.bind(this)
        this.handleDirChange = this.handleDirChange.bind(this)
        this.handleTreeSelect = this.handleTreeSelect.bind(this)
        this.handleSave = this.handleSave.bind(this)

        const watcher = fs.watch(dir, {
            recursive: true
        }, this.handleDirChange)

        this.state = {
            value,
            file,
            tree,
            dir,
            watcher,
            unsavedChanges,
            saving
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
            this.setState({saving:false, unsavedChanges: false})
        }
        callback = callback.bind(this)
        this.setState({saving:true})
        fs.writeFile(this.state.file, this.state.value, callback);
    }

    render() {
        let editor = this.state.file.endsWith("md")
            ? <EditorPreview value={this.state.value} handleChange={this.handleChange}/>
            : "file not supported"

        let saveButton = <Button type={this.state.unsavedChanges ? "primary" : ""} shape="circle" size={"large"} onClick={this.handleSave}>
            <i className="fa fa-floppy-o" aria-hidden="true"></i>
        </Button>
        return (
            <div className="App">
                <div className="AppBar row">
                    {saveButton}
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
