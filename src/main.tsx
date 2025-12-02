import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import './style.css'

const appElement = document.getElementById("app")
if (!appElement) throw new Error("Element #app not found")

const root = ReactDOM.createRoot(appElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
