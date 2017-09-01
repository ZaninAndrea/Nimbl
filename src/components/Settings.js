import React, {Component} from 'react';
import { Modal, Button, Checkbox, InputNumber, Select } from 'antd';
const { Option, OptGroup } = Select;
const ButtonGroup = Button.Group;

class Settings extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Modal
          title="Settings"
          footer={null} // disable footer
          visible={this.props.visible}
          onCancel={this.props.handleSettingsModalClose}
        >
            <Checkbox checked={this.props.settings.showSidebar} onClick={this.props.handleSidebarToggle}>
                sidebar
            </Checkbox><br />
            <Checkbox checked={this.props.settings.showPreview} onClick={this.props.handleShowPreviewToggle}>
                preview
            </Checkbox><br />
            {this.props.settings.refreshRate<500 ? <i className="fa fa-exclamation-triangle" aria-hidden="true"></i> : ""} preview refresh rate &nbsp;
            <InputNumber
                step={0.1}
               min={0}
               max={5}
               style={{ marginLeft: 6 }}
               value={this.props.settings.refreshRate/1000}
               onChange={this.props.handleRefreshRateChange}
           />  <br />
           theme &nbsp;
            <Select
                defaultValue="solarized_dark"
                value={this.props.settings.editorTheme}
                style={{ width: 200 }}
                onChange={this.props.handleThemeChange}
            >
                <OptGroup label="Dark">
                    <Option value="monokai">Monokai</Option>
                    <Option value="twilight">Twilight</Option>
                    <Option value="terminal">Terminal</Option>
                    <Option value="solarized_dark">Solarized Dark</Option>
                </OptGroup>
                <OptGroup label="Light">
                    <Option value="github">Github</Option>
                    <Option value="tomorrow">Tomorrow</Option>
                    <Option value="kuroir">Kuroir</Option>
                    <Option value="xcode">XCode</Option>
                    <Option value="textmate">TextMate</Option>
                    <Option value="solarized_light">Solarized Light</Option>
                </OptGroup>
            </Select>
            <br />
            <b>Markdown extensions</b><br />
            <Checkbox checked={this.props.settings.mdSettings.linkify} onClick={()=>this.props.handleMdSettingsChange("linkify",!this.props.settings.mdSettings.linkify)}>
                linkify
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.Typographer} onClick={()=>this.props.handleMdSettingsChange("Typographer",!this.props.settings.mdSettings.Typographer)}>
                Typographer
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.breaks} onClick={()=>this.props.handleMdSettingsChange("breaks",!this.props.settings.mdSettings.breaks)}>
                breaks
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.checkbox} onClick={()=>this.props.handleMdSettingsChange("checkbox",!this.props.settings.mdSettings.checkbox)}>
                checkbox
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.anchor} onClick={()=>this.props.handleMdSettingsChange("anchor",!this.props.settings.mdSettings.anchor)}>
                anchor
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.toc} onClick={()=>this.props.handleMdSettingsChange("toc",!this.props.settings.mdSettings.toc)}>
                toc
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.katex} onClick={()=>this.props.handleMdSettingsChange("katex",!this.props.settings.mdSettings.katex)}>
                katex
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.smartarrows} onClick={()=>this.props.handleMdSettingsChange("smartarrows",!this.props.settings.mdSettings.smartarrows)}>
                smartarrows
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.alert} onClick={()=>this.props.handleMdSettingsChange("alert",!this.props.settings.mdSettings.alert)}>
                alert
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.note} onClick={()=>this.props.handleMdSettingsChange("note",!this.props.settings.mdSettings.note)}>
                note
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.spoiler} onClick={()=>this.props.handleMdSettingsChange("spoiler",!this.props.settings.mdSettings.spoiler)}>
                spoiler
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.url} onClick={()=>this.props.handleMdSettingsChange("url",!this.props.settings.mdSettings.url)}>
                url
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.youtube} onClick={()=>this.props.handleMdSettingsChange("youtube",!this.props.settings.mdSettings.youtube)}>
                youtube
            </Checkbox><br />
            <Checkbox checked={this.props.settings.mdSettings.graph} onClick={()=>this.props.handleMdSettingsChange("graph",!this.props.settings.mdSettings.graph)}>
                graph
            </Checkbox><br />
        </Modal>
    }
}

export default Settings;
