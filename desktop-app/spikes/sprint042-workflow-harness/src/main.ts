import "../../../src/mainview/app.css";
import App from "../../../src/mainview/App.vue";
import VxeUIBase from "vxe-pc-ui";
import VxeEnglish from "vxe-pc-ui/lib/language/en-US";
import VxeUITable from "vxe-table";
import "vxe-pc-ui/lib/style.css";
import "vxe-table/lib/style.css";
import "vanilla-jsoneditor/themes/jse-theme-dark.css";
import { createApp, defineComponent, h, onMounted, ref } from "vue";
import HelpCenterDialog from "../../../src/mainview/components/HelpCenterDialog.vue";
import { harnessSnapshot, rpc, failNextPreview } from "./mockRpc";

VxeUIBase.setI18n("en-US", VxeEnglish);
VxeUIBase.setLanguage("en-US");
Object.assign(window, { __openamxHarnessSnapshot: harnessSnapshot });

const Harness = defineComponent({
	setup() {
		return () => h("div", [
			h("button", {
				id: "fail-next-preview",
				style: "position:fixed;right:16px;top:44px;z-index:40",
				onClick: () => { failNextPreview.value = true; }
			}, "Fail next preview"),
			h(App, { rpc })
		]);
	}
});

const initialHelpSection = new URLSearchParams(window.location.search).get("help-section");
const Root = initialHelpSection === null ? Harness : defineComponent({
	setup() {
		const open = ref(false);
		onMounted(() => { open.value = true; });
		return () => h(HelpCenterDialog, { open: open.value, initialSection: initialHelpSection, shortcuts: [], onClose: () => undefined });
	}
});

createApp(Root).use(VxeUIBase).use(VxeUITable).mount("#app");