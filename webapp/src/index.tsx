/* @refresh reload */
import { render } from "solid-js/web";
import { initTelegram } from "./lib/telegram";
import "./styles/shared.css";
import App from "./App";

initTelegram();

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(() => <App />, root);
