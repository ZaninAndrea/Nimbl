import React, {Component} from "react"
import {Modal} from "antd"
import path from "path"
const electron = window.require("electron")
// the following are basically imports working around webpack
const fs = electron.remote.require("fs")

class CreateFolderModal extends Component {
    constructor() {
        super()
        this.state = {
            value: "",
        }
    }

    render() {
        const createFolder = () => {
            const folderPath = path.join(this.props.currentDirectory, this.state.value)
            fs.mkdirSync(folderPath)
            this.props.onClose()
        }

        const onClose = () => {
            this.setState({value: ""})
            this.props.onClose()
        }
        return (
            <Modal
                className={this.props.theme}
                title="Create new folder"
                visible={this.props.visible}
                closable={true}
                okText="Create folder"
                cancelText="Nevermind"
                maskClosable={true}
                zIndex={10000}
                onOk={createFolder}
                onCancel={onClose}
                onClose={onClose}
            >
                <input
                    onChange={e => this.setState({value: e.target.value})}
                    value={this.state.value}
                    onKeyPress={e => {
                        if (e.key === "Enter") {
                            createFolder()
                            this.setState({value: ""})
                        }
                    }}
                    autofocus
                />
            </Modal>
        )
    }
}

export default CreateFolderModal
