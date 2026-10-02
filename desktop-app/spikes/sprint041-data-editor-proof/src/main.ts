import { createApp } from "vue";
import VxeUIBase from "vxe-pc-ui";
import VxeEnglish from "vxe-pc-ui/lib/language/en-US";
import VxeUITable from "vxe-table";
import "vxe-pc-ui/lib/style.css";
import "vxe-table/lib/style.css";
import "vanilla-jsoneditor/themes/jse-theme-dark.css";
import App from "./App.vue";

VxeUIBase.setI18n("en-US", VxeEnglish);
VxeUIBase.setLanguage("en-US");

createApp(App).use(VxeUIBase).use(VxeUITable).mount("#app");