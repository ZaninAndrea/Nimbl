import React, {Component} from "react"
import {Modal, Button, Checkbox, InputNumber, Select, Slider} from "antd"
const {Option, OptGroup} = Select
const ButtonGroup = Button.Group

class Settings extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        if (this.props.showAdvancedSettings) {
            return (
                <Modal
                    title="Settings"
                    footer={null} // disable footer
                    visible={this.props.visible}
                    onCancel={this.props.handleSettingsModalClose}
                    className={this.props.settings.editorTheme}
                >
                    <Button onClick={this.props.toggleAdvancedSettings}>
                        Hide Advanced Settings
                    </Button>
                    <br />
                    <Checkbox
                        checked={this.props.settings.showSidebar}
                        onClick={this.props.handleSidebarToggle}
                    >
                        sidebar
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.showPreview}
                        onClick={this.props.handleShowPreviewToggle}
                    >
                        preview
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.autoSave}
                        onClick={this.props.autoSaveToggle}
                    >
                        autoSave
                    </Checkbox>
                    <br />
                    preview refresh rate &nbsp;
                    <InputNumber
                        step={0.1}
                        min={0}
                        max={5}
                        style={{marginLeft: 6}}
                        value={this.props.settings.refreshRate / 1000}
                        onChange={this.props.handleRefreshRateChange}
                    />&nbsp;
                    {this.props.settings.refreshRate < 500 ? (
                        <i className="fa fa-exclamation-triangle" aria-hidden="true" />
                    ) : (
                        ""
                    )}
                    <br />
                    theme &nbsp;
                    <Select
                        defaultValue="solarized_dark"
                        value={this.props.settings.editorTheme}
                        style={{width: 200}}
                        onChange={this.props.handleThemeChange}
                    >
                        <OptGroup label="Dark">
                            {/* <Option value="monokai">Monokai</Option>
                            <Option value="twilight">Twilight</Option>
                            <Option value="terminal">Terminal</Option> */}
                            <Option value="solarized_dark">Solarized Dark</Option>
                        </OptGroup>
                        <OptGroup label="Light">
                            {/* <Option value="github">Github</Option>
                            <Option value="tomorrow">Tomorrow</Option>
                            <Option value="kuroir">Kuroir</Option>
                            <Option value="xcode">XCode</Option>
                            <Option value="textmate">TextMate</Option> */}
                            <Option value="solarized_light">Solarized Light</Option>
                        </OptGroup>
                    </Select>
                    <br />
                    <b>Markdown extensions</b>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.typographer}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "typographer",
                                !this.props.settings.mdSettings.typographer
                            )
                        }
                    >
                        typographer
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.breaks}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "breaks",
                                !this.props.settings.mdSettings.breaks
                            )
                        }
                    >
                        breaks
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.checkbox}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "checkbox",
                                !this.props.settings.mdSettings.checkbox
                            )
                        }
                    >
                        checkbox
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.anchor}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "anchor",
                                !this.props.settings.mdSettings.anchor
                            )
                        }
                    >
                        anchor
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.toc}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "toc",
                                !this.props.settings.mdSettings.toc
                            )
                        }
                    >
                        toc
                    </Checkbox>
                    <br />
                    {this.props.settings.mdSettings.toc ? (
                        <p>
                            Levels to show:
                            <Checkbox
                                checked={this.props.settings.mdSettings.tocLevels.includes(1)}
                                onClick={() =>
                                    this.props.handleMdSettingsChange(
                                        "tocLevels",
                                        this.props.settings.mdSettings.tocLevels.includes(1)
                                            ? this.props.settings.mdSettings.tocLevels.filter(
                                                  x => x !== 1
                                              )
                                            : [...this.props.settings.mdSettings.tocLevels, 1]
                                    )
                                }
                            >
                                1
                            </Checkbox>&nbsp;&nbsp;
                            <Checkbox
                                checked={this.props.settings.mdSettings.tocLevels.includes(2)}
                                onClick={() =>
                                    this.props.handleMdSettingsChange(
                                        "tocLevels",
                                        this.props.settings.mdSettings.tocLevels.includes(2)
                                            ? this.props.settings.mdSettings.tocLevels.filter(
                                                  x => x !== 2
                                              )
                                            : [...this.props.settings.mdSettings.tocLevels, 2]
                                    )
                                }
                            >
                                2
                            </Checkbox>&nbsp;&nbsp;
                            <Checkbox
                                checked={this.props.settings.mdSettings.tocLevels.includes(3)}
                                onClick={() =>
                                    this.props.handleMdSettingsChange(
                                        "tocLevels",
                                        this.props.settings.mdSettings.tocLevels.includes(3)
                                            ? this.props.settings.mdSettings.tocLevels.filter(
                                                  x => x !== 3
                                              )
                                            : [...this.props.settings.mdSettings.tocLevels, 3]
                                    )
                                }
                            >
                                3
                            </Checkbox>&nbsp;&nbsp;
                            <Checkbox
                                checked={this.props.settings.mdSettings.tocLevels.includes(4)}
                                onClick={() =>
                                    this.props.handleMdSettingsChange(
                                        "tocLevels",
                                        this.props.settings.mdSettings.tocLevels.includes(4)
                                            ? this.props.settings.mdSettings.tocLevels.filter(
                                                  x => x !== 4
                                              )
                                            : [...this.props.settings.mdSettings.tocLevels, 4]
                                    )
                                }
                            >
                                4
                            </Checkbox>&nbsp;&nbsp;
                            <Checkbox
                                checked={this.props.settings.mdSettings.tocLevels.includes(5)}
                                onClick={() =>
                                    this.props.handleMdSettingsChange(
                                        "tocLevels",
                                        this.props.settings.mdSettings.tocLevels.includes(5)
                                            ? this.props.settings.mdSettings.tocLevels.filter(
                                                  x => x !== 5
                                              )
                                            : [...this.props.settings.mdSettings.tocLevels, 5]
                                    )
                                }
                            >
                                5
                            </Checkbox>&nbsp;&nbsp;
                            <Checkbox
                                checked={this.props.settings.mdSettings.tocLevels.includes(6)}
                                onClick={() =>
                                    this.props.handleMdSettingsChange(
                                        "tocLevels",
                                        this.props.settings.mdSettings.tocLevels.includes(6)
                                            ? this.props.settings.mdSettings.tocLevels.filter(
                                                  x => x !== 6
                                              )
                                            : [...this.props.settings.mdSettings.tocLevels, 6]
                                    )
                                }
                            >
                                6
                            </Checkbox>&nbsp;&nbsp;
                        </p>
                    ) : (
                        ""
                    )}
                    <Checkbox
                        checked={this.props.settings.mdSettings.katex}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "katex",
                                !this.props.settings.mdSettings.katex
                            )
                        }
                    >
                        katex
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.smartarrows}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "smartarrows",
                                !this.props.settings.mdSettings.smartarrows
                            )
                        }
                    >
                        smartarrows
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.alert}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "alert",
                                !this.props.settings.mdSettings.alert
                            )
                        }
                    >
                        alert
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.note}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "note",
                                !this.props.settings.mdSettings.note
                            )
                        }
                    >
                        note
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.spoiler}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "spoiler",
                                !this.props.settings.mdSettings.spoiler
                            )
                        }
                    >
                        spoiler
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.url}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "url",
                                !this.props.settings.mdSettings.url
                            )
                        }
                    >
                        url
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.video}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "video",
                                !this.props.settings.mdSettings.video
                            )
                        }
                    >
                        video
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={this.props.settings.mdSettings.graph}
                        onClick={() =>
                            this.props.handleMdSettingsChange(
                                "graph",
                                !this.props.settings.mdSettings.graph
                            )
                        }
                    >
                        graph
                    </Checkbox>
                    <br />
                </Modal>
            )
        } else {
            const interfaceMarks = {0: "Zen", 1: "Balanced", 2: "Powerhouse"}
            const markdownMarks = {
                0: "Purist",
                1: "Novice",
                2: "Spiced up",
                3: "Plugin addict",
            }

            const settings = this.props.settings.mdSettings
            const isExtended =
                settings.katex && settings.breaks && settings.anchor && settings.typographer
            const isSpiced =
                isExtended && settings.smartarrows && settings.video && settings.url && settings.toc
            const isAddict =
                isSpiced &&
                settings.checkbox &&
                settings.alert &&
                settings.note &&
                settings.spoiler &&
                settings.graph

            const markdownLevel = isAddict ? 3 : isSpiced ? 2 : isExtended ? 1 : 0
            const mdModes = {
                0: {
                    typographer: false,
                    breaks: false,
                    checkbox: false,
                    anchor: false,
                    toc: false,
                    katex: false,
                    smartarrows: false,
                    alert: false,
                    note: false,
                    spoiler: false,
                    url: false,
                    video: false,
                    graph: false,
                },
                1: {
                    typographer: true,
                    breaks: true,
                    checkbox: false,
                    anchor: true,
                    toc: false,
                    katex: true,
                    smartarrows: false,
                    alert: false,
                    note: false,
                    spoiler: false,
                    url: false,
                    video: false,
                    graph: false,
                },
                2: {
                    typographer: true,
                    breaks: true,
                    checkbox: false,
                    anchor: true,
                    toc: true,
                    katex: true,
                    smartarrows: true,
                    alert: false,
                    note: false,
                    spoiler: false,
                    url: true,
                    video: true,
                    graph: false,
                },
                3: {
                    typographer: true,
                    breaks: true,
                    checkbox: true,
                    anchor: true,
                    toc: true,
                    katex: true,
                    smartarrows: true,
                    alert: true,
                    note: true,
                    spoiler: true,
                    url: true,
                    video: true,
                    graph: true,
                },
            }
            const markdownChange = index => this.props.handleMDModeChange(mdModes[index])

            return (
                <Modal
                    title="Settings"
                    footer={null} // disable footer
                    visible={this.props.visible}
                    onCancel={this.props.handleSettingsModalClose}
                    className={this.props.settings.editorTheme}
                >
                    <b>Interface complexity</b>
                    <Slider
                        marks={interfaceMarks}
                        step={null}
                        value={1}
                        min={0}
                        max={2}
                        tipFormatter={id => interfaceMarks[id]}
                    />
                    <b>Markdown extensions</b>
                    <Slider
                        marks={markdownMarks}
                        step={null}
                        value={markdownLevel}
                        min={0}
                        max={3}
                        tipFormatter={id => markdownMarks[id]}
                        onChange={markdownChange}
                    />
                    <Button onClick={this.props.toggleAdvancedSettings}>
                        Show Advanced Settings
                    </Button>
                </Modal>
            )
        }
    }
}

export default Settings
