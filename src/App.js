import React, {Component} from 'react';
import './stylesheets/App.css';
import './stylesheets/EditorPreview.css';
import './stylesheets/highlight.css';
import EditorPreview from "./components/EditorPreview.js"
import Tree from "./components/Tree.js"
const electron = window.require('electron');
const fs = electron.remote.require('fs');
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
        let dir = "D:\\docs\\reusable"
        let file = "test.md"
        let tree = buildTree(dir)
        let value = file
            ? fs.readFileSync(file).toString()
            : ""

        console.log(tree);
        this.state = {
            value: value,
            file: file,
            tree: tree,
            dir: dir
        };

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(newValue) {
        this.setState({value: newValue});
    }

    render() {
        return (
            <div className="App row">
                <div className="sidebar col-xs-2">
                    <Tree tree={this.state.tree}/>
                </div>
                <div className="mainEditor col-xs-10">
                    <EditorPreview value={this.state.value} handleChange={this.handleChange}/>
                </div>
            </div>
        );
    }
}

export default App;
