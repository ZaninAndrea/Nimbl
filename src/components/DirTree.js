import React, {Component} from 'react';
import mime from "mime";
import path from "path"
import { Tree } from 'antd';
import {buildDirTree, replaceInTree} from "../utilities/treeUtils"
const TreeNode = Tree.TreeNode;

class DirTree extends React.Component {
  render() {
    const loop = data => data.map((item) => {
      if (item.children) { // loaded directory
        return <TreeNode title={<span>
                    <i className="folderIcon fa fa-folder" aria-hidden="true"></i>&nbsp;
                    {item.name}
                </span>} key={item.key} position={item.position}>{loop(item.children)}</TreeNode>;
      }
      else if (!item.isLeaf){ // not loaded directory
          return <TreeNode title={<span>
                      <i className="folderIcon fa fa-folder" aria-hidden="true"></i>&nbsp;
                      {item.name}
                  </span>} key={item.key} position={item.position}></TreeNode>;
      }
      else { // file
          const fileMime = mime.lookup(item.key)
          const icon = fileMime === "text/x-markdown" || fileMime === "text/markdown" // select the right icon for that file
              ? "fileIcon fa fa-file-text"
              : fileMime.startsWith("image")
              ? "fileIcon fa fa-file-image-o"
              : "fileIcon fa fa-file"

          return <TreeNode title={
                  <span>
                      <i className={icon} aria-hidden="true"></i>&nbsp;
                      {item.name}
                  </span>} key={item.key} position={item.position} isLeaf={item.isLeaf}/>
      }
    });
    const treeNodes = loop(this.props.treeData.children);

    return (
      <Tree draggable={false}
            className="sidebarTree"
            defaultExpandedKeys={[]}
            onExpand={this.props.onExpand}
            expandedKeys={this.props.expandedKeys}
            selectedKeys={this.props.selectedKeys}
            autoExpandParent={false}
            onDrop={info => console.log(info)} onSelect={this.props.onSelect} loadData={this.props.onLoadData}>
        {treeNodes}
      </Tree>
    );
  }
}

export default DirTree
