import React, {Component} from 'react';
import {Tree} from 'antd';
import path from "path"
import mime from "mime"
const TreeNode = Tree.TreeNode;

class TreeComponent extends Component {
    render() {
        const buildTree = tree => {
            let nodes = []
            for (let idx in tree.subfolders) {
                nodes.push(
                    <TreeNode title={
                        <span>
                            <i className="folderIcon fa fa-folder" aria-hidden="true"></i>&nbsp;
                            {path.basename(tree.subfolders[idx].dir)}
                        </span>}
                        key={tree.subfolders[idx].dir}>{buildTree(tree.subfolders[idx])}</TreeNode>
                )
            }

            for (let idx in tree.files) {
                const filePath = path.normalize(path.join(tree.dir, tree.files[idx]))
                const fileMime = mime.lookup(filePath)
                const icon = fileMime === "text/x-markdown"
                    ? "fileIcon fa fa-file-text"
                    : fileMime.startsWith("image")
                    ? "fileIcon fa fa-file-image-o"
                    : "fileIcon fa fa-file"
                nodes.push(<TreeNode title={
                    <span>
                        <i className={icon} aria-hidden="true"></i>&nbsp;
                        {tree.files[idx]}
                    </span>}
                key={filePath}/>)
            }
            return nodes
        }

        return (
            <Tree className="sidebar" draggable defaultExpandedKeys={[]} onDrop={info => console.log(info)} onSelect={this.props.onSelect}>
                {buildTree(this.props.tree)}
            </Tree>
        );
    }
}

export default TreeComponent;
