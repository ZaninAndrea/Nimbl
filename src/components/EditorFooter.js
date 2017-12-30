import React, {Component} from "react"
import {Button, ButtonGroup} from "react-fluid-buttons"

class EditorFooter extends Component {
    render() {
        return (
            <div className="editorFooter">
                <p className="charCount">{this.props.value.length} characters</p>
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
