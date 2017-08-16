var hljs = require('highlight.js');
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

var md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: false,
    breaks: true,
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }

        return ''; // use external default escaping
    }
})
md.use(require('markdown-it-task-checkbox'))
md.use(require("../utilities/markdown-it-anchor.js"))
md.use(require("markdown-it-table-of-contents"), {
    "includeLevel": [1, 2, 3, 4]
})
md.use(require('markdown-it-katex'), {
    "throwOnError": false,
    "errorColor": " #cc0000"
})
md.use(require('markdown-it-smartarrows'))
md.use(require('markdown-it-container'), 'alert', {

    validate: function(params) {
        return params.trim().match(/^alert\s+(.*)$/);
    },

    render: function(tokens, idx) {
        var m = tokens[idx].info.trim().match(/^alert\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
            // opening tag
            return '<div class="md-container warning"><h3><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + md.utils.escapeHtml(m[1]) + '</h3>\n';

        } else {
            // closing tag
            return '</div>\n';
        }
    }
});
md.use(require('markdown-it-container'), 'note', {

    validate: function(params) {
        return params.trim().match(/^note\s+(.*)$/);
    },

    render: function(tokens, idx) {
        var m = tokens[idx].info.trim().match(/^note\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
            // opening tag
            return '<div class="md-container note"><h3><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + md.utils.escapeHtml(m[1]) + '</h3>\n';

        } else {
            // closing tag
            return '</div>\n';
        }
    }
});

md.use(require('markdown-it-container'), 'url', {

    validate: function(params) {
        return params.trim().match(/^url\s+(.*)$/);
    },

    render: function(tokens, idx) {
        var m = tokens[idx].info.trim().match(/^url\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
            // opening tag
            return '<div>'+ipcRenderer.sendSync('linkPreview', m[1]);

        } else {
            // closing tag
            return '</div>\n';
        }
    }
});

export default md
