import React, {Component} from "react"
import {Button, ButtonGroup} from "react-fluid-buttons"

function countWords(value) {
    let total = 0
    let previousCharWasWordChar = false
    const isWordChar = char =>
        "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890.".indexOf(char) !== -1
    for (let i of value) {
        if (isWordChar(i) && !previousCharWasWordChar) {
            total++
        }
        previousCharWasWordChar = isWordChar(i)
    }

    return total
}

class EditorFooter extends Component {
    render() {
        const charCountText = `${
            this.props.selection !== "" ? this.props.selection.length + " / " : ""
        }${this.props.value.length} characters`
        const wordCountText = `${
            this.props.selection !== "" ? countWords(this.props.selection) + " / " : ""
        }${countWords(this.props.value)} words`
        return (
            <div className="editorFooter">
                <p className="charCount" title={charCountText}>
                    {charCountText}
                </p>
                <p className="wordCount" title={wordCountText}>
                    {wordCountText}
                </p>
                <div className="leftAligned">
                    <ButtonGroup>
                        <Button onClick={this.props.handleShowPreviewToggle}>
                            <i
                                className={
                                    this.props.settings.showPreview
                                        ? "material-icons active"
                                        : "material-icons"
                                }
                            >
                                web
                            </i>
                        </Button>
                        <Button onClick={this.props.handleSidebarToggle}>
                            <i
                                className={
                                    this.props.settings.showSidebar
                                        ? "material-icons active"
                                        : "material-icons"
                                }
                            >
                                view_list
                            </i>
                        </Button>
                        <Button onClick={this.props.autoSaveToggle}>
                            <i
                                className={
                                    this.props.settings.autoSave
                                        ? "material-icons active"
                                        : "material-icons"
                                }
                            >
                                autorenew
                            </i>
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        )
    }
}

export default EditorFooter
