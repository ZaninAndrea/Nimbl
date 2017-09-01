import React, {Component} from 'react';
import {findDOMNode} from "react-dom";
import AceEditor from 'react-ace';
import brace from 'brace' // https://github.com/thlorenz/brace browserify compatible version of the ace editor
import 'brace/snippets/markdown';
import 'brace/ext/language_tools'
import 'brace/mode/markdown';
import 'brace/ext/searchbox';
import 'brace/theme/monokai';
import 'brace/theme/github';
import 'brace/theme/tomorrow';
import 'brace/theme/kuroir';
import 'brace/theme/twilight';
import 'brace/theme/xcode';
import 'brace/theme/textmate';
import 'brace/theme/solarized_dark';
import 'brace/theme/solarized_light';
import 'brace/theme/terminal';
const $ = require("jquery")
require("jquery.scrollto")

brace.define("ace/snippets/markdown", [
    "require", "exports", "module"
], function(e, t, n) {
    t.snippetText = 'snippet tbl\n	${1: }|${2: }\n	---|---\n	${3: }|${4: }\n\nsnippet note\n	:::note ${1: }\n	${2: }\n	:::\n	\n\nsnippet alert\n	:::alert ${1: }\n	${2: }\n	:::\n	\nsnippet $\n	$${1: }$\n\nsnippet $$\n	$$\n	${1: }\n	$$\n'
    t.scope = "markdown"
})

class MDEditorPreview extends Component {
    constructor(props) {
        super(props);


        // bind functions
        this.handleSelection = this.handleSelection.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSelection(e) {
        if (!this.props.showPreview) // do nothing if preview is disable
            return

        //     BUILDS THE MAP
        // let map = []
        // let lastValue = 0;
        // for (var i =0; i < e.doc.$lines.length - 1; i++){
        //     const elements = $(`[data-line='${i}']`)
        //     if (elements.length !== 0){
        //         map.push(elements[0].offsetTop)
        //         lastValue=elements[0].offsetTop
        //     }else{
        //         map.push(lastValue)
        //     }
        // }

        // searches for an element corresponding to the selected line or one of the above until it finds one
        let elements = []
        let index = e.anchor.row
        while(elements.length === 0 && index >= 0){
            elements = $(`[data-line='${index}']`)
            index--
        }
        
        if (elements.length!==0){
            var preview = findDOMNode(this.refs["markdown-container"])
            preview.scrollTop = Math.max(0, elements[0].offsetTop-50)
        }

    }

    handleScroll() {
        if (!this.props.showPreview) // do nothing if preview is disable
            return

        // searches for an element corresponding to the selected line or one of the above until it finds one
        let elements = []
        const editor = findDOMNode(this.refs["editor"])
        let index = editor.env.editor.selection.getCursor().row
        while(elements.length === 0 && index >= 0){
            elements = $(`[data-line='${index}']`)
            index--
        }

        if (elements.length!==0){
            var preview = findDOMNode(this.refs["markdown-container"])
            preview.scrollTop = Math.max(0, elements[0].offsetTop-50)
        }
    }

    handleChange(newValue){
        this.props.handleChange(newValue)
        this.handleScroll()
    }

    render() {
        let aceEditor = <AceEditor ref="editor"
            onSelectionChange={this.handleSelection}
            onScroll={this.handleScroll}
            mode="markdown"
            theme={this.props.theme}
            onChange={this.props.handleChange}
            name="editor"
            value={this.props.value}
            editorProps={{
                $blockScrolling: true
            }}
            showGutter={true}
            showPrintMargin={false}
            highlightActiveLine={false}
            wrapEnabled={true}
            height="100%"
            width="100%"
            setOptions={{
                "enableSnippets": true
            }}
            commands={[
                {
                    name: 'save',
                    bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                    exec: this.props.handleSave,
                    readOnly: true // false if this command should not apply in readOnly mode
                }
            ]}
        />

        if (this.props.showPreview){ // display preview or not
            return (
                <div className="MDEditorPreview row">
                    <div className="editorWrapper col-xs-6">
                        {aceEditor}
                    </div>
                    <div className="markdown-container col-xs-6" ref="markdown-container">
                        <div className="markdown-body" dangerouslySetInnerHTML={{
                            __html: this.props.preview
                        }}></div>
                    </div>
                </div>

            );
        }
        else{
            return (<div className="MDEditorPreview row">
                <div className="editorWrapper col-xs-12">
                    {aceEditor}
                </div>
            </div>)
        }
    }
}

export default MDEditorPreview;
