import newMd from "./markdown-it-conf"
import buildTree from "./treeUtils.js"
import handlebars from "handlebars"
import yaml from "js-yaml"
import path from "path"
import katex from "katex"

const electron = window.require("electron")
// the following are basically imports working around webpack
const fs = electron.remote.require("fs")
const markdownToc = electron.remote.require("markdown-toc")

// recursively copies a directory into another
const deepCopyDir = (dir, outputDir, fileSaveFunc) => {
    const elements = fs.readdirSync(dir)
    for (let i in elements) {
        if (fs.statSync(path.join(dir, elements[i])).isDirectory()) {
            if (!fs.existsSync(path.join(outputDir, elements[i]))) {
                // if output directory does not exist, create it
                fs.mkdirSync(path.join(outputDir, elements[i]))
            }

            deepCopyDir(path.join(dir, elements[i]), path.join(outputDir, elements[i]))
        } else {
            if (fileSaveFunc) {
                fileSaveFunc(outputDir, dir, elements[i])
            } else {
                const data = fs.readFileSync(path.join(dir, elements[i]), "utf8")
                const dest = path.join(outputDir, elements[i])
                fs.writeFileSync(dest, data)
            }
        }
    }
}

// recursively deletes the content of a directory
const deepDeleteDir = dir => {
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

function buildSite(dir, settings, outputDir = "gh-pages") {
    const md = newMd({}, dir)
    try {
        // load the yaml config and generate the site accordingly
        var yamlConfig = yaml.safeLoad(fs.readFileSync(path.join(dir, "config.yml"), "utf8"))

        if (!fs.existsSync(path.join(dir, outputDir))) {
            // if output directory does not exist, create it
            fs.mkdirSync(path.join(dir, outputDir))
        } else {
            // if it exists clear it
            deepDeleteDir(path.join(dir, outputDir))
        }

        // load handlebars partials
        if (fs.existsSync(path.join(dir, yamlConfig.templates.partials))) {
            const files = fs.readdirSync(path.join(dir, yamlConfig.templates.partials))
            for (let i in files) {
                handlebars.registerPartial(
                    path.basename(files[i], path.extname(files[i])),
                    fs.readFileSync(path.join(dir, yamlConfig.templates.partials, files[i]), "utf8")
                )
            }
        }

        // loop over each file and create it's html page
        const pageSource = fs.readFileSync(path.join(dir, yamlConfig.templates.page), "utf8")
        const pageTemplate = handlebars.compile(pageSource)

        const sitemap = Object.keys(yamlConfig.sitemap).map(page => ({
            title: page,
            link:
                "./" +
                path.basename(
                    yamlConfig.sitemap[page].path,
                    path.extname(yamlConfig.sitemap[page].path)
                ) +
                ".html",
        }))

        let index = 0
        const saveMdFunc = (destDir, inputDir, inputFile) => {
            if (inputFile.endsWith(".md")) {
                const mdSource = fs.readFileSync(path.join(inputDir, inputFile), "utf8")

                // creating jsonToc with rendered latex
                const toc = markdownToc(mdSource)
                let jsonToc = toc.json
                // jsonToc = jsonToc.map(entry => Object.assign({}, entry, {content:katex.renderToString(entry.content)}))

                // creating small toc, with only h1
                const smallToc = markdownToc(mdSource, {maxdepth: 1})
                let smallJsonToc = smallToc.json
                // smallJsonToc = smallJsonToc.map(entry => Object.assign({}, entry, {content:katex.renderToString(entry.content)}))

                let context = {
                    title: inputFile,
                    markdownBody: md.render(mdSource),
                    jsonToc: jsonToc,
                    htmlToc: md.render(toc.content),
                    smallJsonToc: smallJsonToc,
                    smallHtmlToc: md.render(smallToc.content),
                    siteMap: sitemap.map(
                        (element, id) =>
                            id === index ? Object.assign({}, element, {current: true}) : element
                    ),
                }

                // loads metadata if they exists
                if (fs.existsSync(path.join(inputDir, inputFile + ".meta.yml"))) {
                    // Get document, or throw exception on error
                    try {
                        const doc = yaml.safeLoad(
                            fs.readFileSync(path.join(inputDir, inputFile + ".meta.yml"), "utf8")
                        )
                        context = {...context, ...doc}
                    } catch (e) {
                        console.log(e)
                    }
                }

                const html = pageTemplate(context)
                const destination = path.join(destDir, inputFile.replace(".md", ".html"))
                fs.writeFileSync(destination, html)
                index++
            } else if (inputFile.endsWith(".md.meta.yml")) {
                // ignore metadata files
            } else {
                const data = fs.readFileSync(path.join(inputDir, inputFile), "utf8")
                fs.writeFileSync(path.join(destDir, inputFile), data)
            }
        }
        deepCopyDir(path.join(dir, "assets"), path.join(dir, "gh-pages"), saveMdFunc)

        // loads static assets
        if (
            yamlConfig.templates.assets &&
            fs.statSync(path.join(dir, yamlConfig.templates.assets)).isDirectory()
        ) {
            deepCopyDir(path.join(dir, yamlConfig.templates.assets), path.join(dir, outputDir))
        }
    } catch (e) {
        console.error(e)
    }
}

export default buildSite
