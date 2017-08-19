import md from "./markdown-it-conf.js"
import buildTree from "./treeUtils.js"
import handlebars from "handlebars"
import yaml from 'js-yaml';
import path from "path"
const electron = window.require('electron');
const fs = electron.remote.require('fs');

function buildSite(dir){
    try {
      var yamlConfig = yaml.safeLoad(fs.readFileSync(path.join(dir,"config.yml"), 'utf8'));
      console.log(yamlConfig)

      if (!fs.existsSync(path.join(dir,"gh-pages"))){ // if output directory does not exist, create it
          fs.mkdirSync(path.join(dir,"gh-pages"))
      }

      for (let i in yamlConfig.map){
          const source = fs.readFileSync(path.join(dir,yamlConfig.templates.page), 'utf8')

          const mdSource = fs.readFileSync(path.join(dir,yamlConfig.map[i].path), 'utf8')
          const template = handlebars.compile(source);
          const context = {title: i, markdownBody: md.render(mdSource), details:yamlConfig.map[i]};
          const html = template(context);
          const destination = path.join(dir,"gh-pages",yamlConfig.map[i].path.replace(".md",".html"))
          console.log(destination);
          fs.writeFile(destination, html);
      }

    } catch (e) {
      console.error(e);
    }


}

export default buildSite
