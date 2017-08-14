const electron = window.require('electron');
const fs = electron.remote.require('fs');

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
        if (stat && stat.isDirectory() && element !== ".git")
            // Dive into the directory
            tree.subfolders.push(buildTree(path));
        else if (element !== ".git")
            // Call the action
            tree.files.push(element)
    });

    return tree
}

export default buildTree
