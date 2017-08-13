import React, {Component} from 'react';
import {findDOMNode} from "react-dom";
import AceEditor from 'react-ace';
import brace from 'brace'
import 'brace/snippets/markdown';
import 'brace/ext/language_tools'
// import {snippetManager} from 'brace/ext/language_tools';
import 'brace/mode/markdown';
import 'brace/theme/solarized_dark';
import 'brace/ext/searchbox';

brace.define("ace/snippets/markdown", [
    "require", "exports", "module"
], function(e, t, n) {
    t.snippetText = 'snippet tbl\n	${1: }|${2: }\n	---|---\n	${3: }|${4: }\n\nsnippet note\n	:::note ${1: }\n	${2: }\n	:::\n	\n\nsnippet alert\n	:::alert ${1: }\n	${2: }\n	:::\n	\nsnippet $\n	$${1: }$\n\nsnippet $$\n	$$\n	${1: }\n	$$\n'
    t.scope = "markdown"
})

// setup markdown parser
var hljs = require('highlight.js');
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

class EditorPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mdContainer: null
        };

        this.handleSelection = this.handleSelection.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    handleSelection(e) {
        var preview = findDOMNode(this.refs["markdown-container"])
        var ratio = e.doc.$lines.length === 1
            ? 1
            : e.anchor.row / (e.doc.$lines.length - 1) // avoids division by 0 and allows for ratio 1
        var scrollTarget = preview.scrollHeight * ratio
        preview.scrollTop = scrollTarget
    }

    handleScroll() {
        var preview = findDOMNode(this.refs["markdown-container"])
        var editor = findDOMNode(this.refs["editor"])
        var ratio = editor.env.document.doc.$lines.length === 1
            ? 1
            : editor.env.editor.selection.getCursor().row / (editor.env.document.doc.$lines.length - 1) // avoids division by 0 and allows for ratio 1
        var scrollTarget = preview.scrollHeight * ratio
        preview.scrollTop = scrollTarget
    }

    render() {
        return (
            <div className="EditorPreview row">
                <div className="editorWrapper col-xs-6">
                    <AceEditor ref="editor" onSelectionChange={this.handleSelection} onScroll={this.handleScroll} mode="markdown" theme="solarized_dark" onChange={this.props.handleChange} name="editor" value={this.props.value} editorProps={{
                        $blockScrolling: true
                    }} showGutter={false} showPrintMargin={false} highlightActiveLine={false} height="100%" width="100%" setOptions={{
                        "enableSnippets": true
                    }}/>
                </div>
                <div className="markdown-container col-xs-6" ref="markdown-container">
                    <div className="markdown-body" dangerouslySetInnerHTML={{
                        __html: md.render(this.props.value)
                    }}></div>
                </div>
            </div>

        );
    }
}

export default EditorPreview;
