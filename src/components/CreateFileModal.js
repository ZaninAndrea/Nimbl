import React, {Component} from "react"
import {Modal} from "antd"
import path from "path"
const electron = window.require("electron")
// the following are basically imports working around webpack
const fs = electron.remote.require("fs")

class CreateFileModal extends Component {
    constructor() {
        super()
        this.state = {
            value: "",
        }
    }

    render() {
        const createFile = () => {
            const filePath = path.join(this.props.currentDirectory, this.state.value)
            fs.writeFileSync(filePath, "")
            this.props.onClose()
        }

        const onClose = () => {
            this.setState({value: ""})
            this.props.onClose()
        }
        return (
            <Modal
                className={this.props.theme}
                title="Create new file"
                visible={this.props.visible}
                closable={true}
                okText="Create file"
                cancelText="Nevermind"
                maskClosable={true}
                zIndex={10000}
                onOk={createFile}
                onCancel={onClose}
                onClose={onClose}
            >
                <input
                    onChange={e => this.setState({value: e.target.value})}
                    value={this.state.value}
                    onKeyPress={e => {
                        if (e.key === "Enter") {
                            createFile()
                            this.setState({value: ""})
                        }
                    }}
                />
            </Modal>
        )
    }
}

export default CreateFileModal
