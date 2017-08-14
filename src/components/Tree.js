import React, {Component} from 'react';
import {Tree} from 'antd';
import path from "path"
const TreeNode = Tree.TreeNode;

class TreeComponent extends Component {
    render() {
        const buildTree = tree => {
            let nodes = []
            for (let idx in tree.subfolders) {
                nodes.push(
                    <TreeNode title={path.basename(tree.subfolders[idx].dir)} key={tree.subfolders[idx].dir}>{buildTree(tree.subfolders[idx])}</TreeNode>
                )
            }

            for (let idx in tree.files) {
                nodes.push(<TreeNode title={tree.files[idx]} key={path.normalize(path.join(tree.dir, tree.files[idx]))}/>)
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
