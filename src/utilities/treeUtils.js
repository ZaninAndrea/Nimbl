import path from "path";
const electron = window.require('electron');
const fs = electron.remote.require('fs');

const buildDirTree = (dir, position) => {
    console.log("ENTER");
    let tree = {
        key: dir,
        position: position,
        name: path.basename(dir),
        children: []
    }

    if (!dir){
        return tree
    }

    const list = fs.readdirSync(dir);
    let tempPosition = 0;
    list.forEach(function(element) {
        // Full path of that file
        let path = dir + "/" + element;
        // Get the file's stats
        const stat = fs.statSync(path);
        if (stat && stat.isDirectory()) // dive into any directory
            // Dive into the directory
            tree.children.push({key:path, name:element, position:position.concat([tempPosition])});
        else // create a node of any file
            // Call the action
            tree.children.push({key:path, name:element, isLeaf:true, position:position.concat([tempPosition])})

        tempPosition++
    });

    return tree
}

const replaceInTree = (tree, newValue, posArr) => {
    // console.log(tree);
    if ( posArr.length===0 ){
        return newValue
    }
    else {
        tree.children[posArr[0]]=replaceInTree(tree.children[posArr[0]], newValue, posArr.slice(1))
        return tree
    }
}

export {buildDirTree, replaceInTree}
