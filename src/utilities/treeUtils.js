import path from "path"
const electron = window.require("electron")
const fs = electron.remote.require("fs")

const buildDirTree = (dir, position, expandedNodes = []) => {
    let tree = {
        key: dir,
        position: position,
        name: path.basename(dir),
        children: [],
    }

    if (!dir) {
        return tree
    }

    const list = fs.readdirSync(dir)
    list.sort((a, b) => {
        let pathA = dir + "/" + a
        let pathB = dir + "/" + b
        const statA = fs.statSync(pathA)
        const statB = fs.statSync(pathB)

        // put folders on top
        if (statB.isDirectory() && !statA.isDirectory()) return 1
        if (statA.isDirectory() && !statB.isDirectory()) return -1

        // order by name
        if (a > b) return 1
        if (a < b) return -1
        return 0
    }) //add function
    let tempPosition = 0
    list.forEach(function(element) {
        // Full path of that file
        let path = dir + "/" + element
        // Get the file's stats
        const stat = fs.statSync(path)
        if (stat && stat.isDirectory())
            // Dive into the directory
            tree.children.push(
                expandedNodes.indexOf(path) !== -1
                    ? buildDirTree(path, position.concat([tempPosition]), expandedNodes)
                    : {
                          key: path,
                          name: element,
                          position: position.concat([tempPosition]),
                      }
            ) // create a node of any file
        else
            // Call the action
            tree.children.push({
                key: path,
                name: element,
                isLeaf: true,
                position: position.concat([tempPosition]),
            })

        tempPosition++
    })

    return tree
}

const replaceInTree = (tree, newValue, posArr) => {
    if (posArr.length === 0) {
        return newValue
    } else {
        tree.children[posArr[0]] = replaceInTree(
            tree.children[posArr[0]],
            newValue,
            posArr.slice(1)
        )
        return tree
    }
}

export {buildDirTree, replaceInTree}
