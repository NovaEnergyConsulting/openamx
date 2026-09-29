import "./app.css";
import App from "./App.vue";
import { createApp } from "vue";
import { Electroview } from "electrobun/view";
import type { DesktopRPCSchema } from "../shared/rpc";

const rpc = Electroview.defineRPC<DesktopRPCSchema>({ handlers: {} });
new Electroview({ rpc });

createApp(App, { rpc }).mount("#app");
