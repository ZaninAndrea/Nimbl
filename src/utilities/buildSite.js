import md from "./markdown-it-conf.js"
import buildTree from "./treeUtils.js"
import handlebars from "handlebars"
import yaml from 'js-yaml';
import path from "path"
const electron = window.require('electron');
const fs = electron.remote.require('fs');

// recursively copies a directory into another
const deepCopyDir = (dir, outputDir) => {
    const elements = fs.readdirSync(dir)
    for (let i in elements) {
        if (fs.statSync(path.join(dir, elements[i])).isDirectory()) {
            if (!fs.existsSync(path.join(outputDir, elements[i]))) { // if output directory does not exist, create it
                fs.mkdirSync(path.join(outputDir, elements[i]))
            }

            deepCopyDir(path.join(dir, elements[i]), path.join(outputDir, elements[i]))
        } else {
            const dest = path.join(outputDir, elements[i])
            const data = fs.readFileSync(path.join(dir, elements[i]), 'utf8')
            console.log(dest);
            console.log(path.join(dir, elements[i]));
            fs.writeFileSync(dest, data)
        }
    }
}

// recursively deletes the content of a directory
const deepDeleteDir = (dir) => {
    const elems = fs.readdirSync(dir)
    for (let i in elems) {
        if (fs.statSync(path.join(dir, elems[i])).isDirectory()) {
            deepDeleteDir(path.join(dir, elems[i]))
            fs.rmdirSync(path.join(dir, elems[i]))
        } else {
            fs.unlinkSync(path.join(dir, elems[i]))
        }
    }
}

function buildSite(dir, outputDir = "gh-pages") {
    try {
        // load the yaml config and generate the site accordingly
        var yamlConfig = yaml.safeLoad(fs.readFileSync(path.join(dir, "config.yml"), 'utf8'));

        if (!fs.existsSync(path.join(dir, outputDir))) { // if output directory does not exist, create it
            fs.mkdirSync(path.join(dir, outputDir))
        } else { // if it exists clear it
            deepDeleteDir(path.join(dir, outputDir))
        }

        // loop over each file and create it's html page
        const pageSource = fs.readFileSync(path.join(dir, yamlConfig.templates.page), 'utf8')
        const pageTemplate = handlebars.compile(pageSource);
        for (let i in yamlConfig.map) {

            const mdSource = fs.readFileSync(path.join(dir, yamlConfig.map[i].path), 'utf8')
            const context = {
                title: i,
                markdownBody: md.render(mdSource),
                details: yamlConfig.map[i]
            };
            const html = pageTemplate(context);
            const destination = path.join(dir, "gh-pages", yamlConfig.map[i].path.replace(".md", ".html"))
            fs.writeFileSync(destination, html);
        }

        // loads static assets
        if (yamlConfig.assets && fs.statSync(path.join(dir, yamlConfig.assets)).isDirectory()) {
            deepCopyDir(path.join(dir, yamlConfig.assets), path.join(dir, outputDir))
        }

    } catch (e) {
        console.error(e);
    }

}

export default buildSite
