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
import md from "../utilities/markdown-it-conf"

brace.define("ace/snippets/markdown", [
    "require", "exports", "module"
], function(e, t, n) {
    t.snippetText = 'snippet tbl\n	${1: }|${2: }\n	---|---\n	${3: }|${4: }\n\nsnippet note\n	:::note ${1: }\n	${2: }\n	:::\n	\n\nsnippet alert\n	:::alert ${1: }\n	${2: }\n	:::\n	\nsnippet $\n	$${1: }$\n\nsnippet $$\n	$$\n	${1: }\n	$$\n'
    t.scope = "markdown"
})

class EditorPreview extends Component {
    constructor(props) {
        super(props);

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
