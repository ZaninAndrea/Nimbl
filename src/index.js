import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
const {webFrame} = window.require("electron")
webFrame.setZoomLevelLimits(1, 1)

// import registerServiceWorker from './utilities/registerServiceWorker';

ReactDOM.render(<App />, document.getElementById("root"))
// registerServiceWorker();
