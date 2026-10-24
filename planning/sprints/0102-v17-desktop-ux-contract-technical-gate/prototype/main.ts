import { createApp, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "reka-ui";

type PanelSizes = { explorerWidth: number; previewWidth: number };
type FocusMode = "none" | "editor" | "preview";

const persistedByProject = new Map<string, PanelSizes>([
	["Project A", { explorerWidth: 220, previewWidth: 44 }],
	["Project B", { explorerWidth: 300, previewWidth: 55 }],
]);

const app = defineComponent({
	setup() {
		const project = ref("Project A");
		const sizes = ref({ ...persistedByProject.get(project.value)! });
		const initialSizes = ref({ ...sizes.value });
		const layoutSizes = ref({ ...sizes.value });
		const groupWidth = ref(window.innerWidth - 26);
		const stacked = ref(window.innerWidth <= 900);
		const focusMode = ref<FocusMode>("none");
		const writeCount = ref(0);
		const lastRpc = ref("No resize has been persisted.");
		const layoutHost = ref<HTMLElement>();
		let observer: ResizeObserver | undefined;
		let pointerAdjustmentPending = false;

		function refreshViewport() {
			stacked.value = window.innerWidth <= 900;
			const nextWidth = layoutHost.value?.clientWidth ?? 0;
			if (nextWidth > 0 && Math.round(nextWidth) !== Math.round(groupWidth.value)) {
				groupWidth.value = nextWidth;
				initialSizes.value = { ...sizes.value };
			}
		}

		function setPanelSizes(value: PanelSizes) {
			persistedByProject.set(project.value, { ...value });
			sizes.value = { ...value };
			initialSizes.value = { ...value };
			writeCount.value++;
			lastRpc.value = `${project.value}: ${value.explorerWidth.toFixed(0)}px / ${value.previewWidth.toFixed(1)}%`;
		}

		function onLayout(layout: number[]) {
			if (layout.length !== 3 || groupWidth.value <= 0) return;
			const panelSpace = groupWidth.value - 16;
			const nextSizes = {
				explorerWidth: layout[0]! * panelSpace / 100,
				previewWidth: layout[2]! * panelSpace / groupWidth.value,
			};
			layoutSizes.value = nextSizes;
		}

		function selectProject(value: string) {
			project.value = value;
			sizes.value = { ...persistedByProject.get(value)! };
			initialSizes.value = { ...sizes.value };
			layoutSizes.value = { ...sizes.value };
		}

		function onHandleKeydown(event: KeyboardEvent) {
			if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
				const before = { ...layoutSizes.value };
				window.setTimeout(() => {
					const after = layoutSizes.value;
					if (Math.abs(after.explorerWidth - before.explorerWidth) > 0.1 || Math.abs(after.previewWidth - before.previewWidth) > 0.01)
						setPanelSizes(after);
				}, 0);
			}
		}

		function onHandleDragging(dragging: boolean) {
			if (dragging) pointerAdjustmentPending = true;
			else if (pointerAdjustmentPending) {
				setPanelSizes(layoutSizes.value);
				pointerAdjustmentPending = false;
			}
		}

		function pane(name: string, className: string) {
			return h("section", { class: `pane ${className}`, "data-pane": name }, [
				h("h2", name),
				h("p", name === "Runtime" ? "Independent bottom row" : `${project.value} · ${name} content`),
			]);
		}

		function splitter() {
			const width = groupWidth.value || window.innerWidth - 40;
			const panelSpace = width - 16;
			const contextMinimum = Math.max(260, width * 0.25);
			const explorerMaximum = Math.min(400, panelSpace - contextMinimum - 260);
			const explorerPixels = Math.min(explorerMaximum, Math.max(160, initialSizes.value.explorerWidth));
			const contextMaximum = Math.min(width * 0.65, panelSpace - 160 - 260);
			const contextAvailable = panelSpace - explorerPixels - 260;
			const contextPixels = Math.min(contextMaximum, contextAvailable, Math.max(contextMinimum, width * initialSizes.value.previewWidth / 100));
			const editorPixels = panelSpace - explorerPixels - contextPixels;
			const asPanelPercent = (pixels: number) => pixels / panelSpace * 100;

			return h(SplitterGroup, {
				key: `${project.value}-${Math.round(width)}`,
				id: "s102-workbench",
				direction: "horizontal",
				keyboardResizeBy: 1,
				class: "splitter-group",
				onLayout,
			}, {
				default: () => [
					h(SplitterPanel, {
						id: "explorer-panel",
						order: 1,
						sizeUnit: "%",
						defaultSize: asPanelPercent(explorerPixels),
						minSize: asPanelPercent(160),
						maxSize: asPanelPercent(400),
						class: "splitter-panel",
					}, { default: () => pane("Explorer", "explorer") }),
					h(SplitterResizeHandle, {
						id: "explorer-handle",
						class: "splitter-handle",
						"aria-label": "Resize explorer",
						onKeydownCapture: onHandleKeydown,
						onDragging: onHandleDragging,
					}),
					h(SplitterPanel, {
						id: "editor-panel",
						order: 2,
						sizeUnit: "%",
						defaultSize: asPanelPercent(editorPixels),
						minSize: asPanelPercent(260),
						class: "splitter-panel",
					}, { default: () => pane("Editor", "editor") }),
					h(SplitterResizeHandle, {
						id: "context-handle",
						class: "splitter-handle",
						"aria-label": "Resize contextual pane",
						onKeydownCapture: onHandleKeydown,
						onDragging: onHandleDragging,
					}),
					h(SplitterPanel, {
						id: "context-panel",
						order: 3,
						sizeUnit: "%",
						defaultSize: asPanelPercent(contextPixels),
						minSize: asPanelPercent(contextMinimum),
						maxSize: asPanelPercent(contextMaximum),
						class: "splitter-panel",
					}, { default: () => pane("Context", "context") }),
				],
			});
		}

		function workbench() {
			if (focusMode.value !== "none") {
				return h("div", { class: "focus-workbench", "data-focus": focusMode.value }, [
					pane(focusMode.value === "editor" ? "Editor" : "Context", "focus-pane"),
				]);
			}
			if (stacked.value) {
				return h("div", { class: "stacked-workbench", "data-layout": "stacked" }, [
					pane("Explorer", "explorer"),
					pane("Editor", "editor"),
					pane("Context", "context"),
				]);
			}
			return splitter();
		}

		onMounted(() => {
			refreshViewport();
			observer = new ResizeObserver(refreshViewport);
			if (layoutHost.value) observer.observe(layoutHost.value);
			window.addEventListener("resize", refreshViewport);
		});
		onUnmounted(() => {
			observer?.disconnect();
			window.removeEventListener("resize", refreshViewport);
		});

		return () => h("main", { class: "app" }, [
			h("header", [h("strong", "Sprint 102 Resizable Prototype"), h("span", "Reka UI 2.10.5")]),
			h("nav", { class: "controls", "aria-label": "Prototype controls" }, [
				h("button", { onClick: () => selectProject("Project A"), "aria-pressed": String(project.value === "Project A") }, "Project A"),
				h("button", { onClick: () => selectProject("Project B"), "aria-pressed": String(project.value === "Project B") }, "Project B"),
				h("button", { onClick: () => { focusMode.value = focusMode.value === "editor" ? "none" : "editor"; } }, "Focus editor"),
				h("button", { onClick: () => { focusMode.value = focusMode.value === "preview" ? "none" : "preview"; } }, "Focus context"),
				h("button", { onClick: () => { focusMode.value = "none"; } }, "Exit focus"),
			]),
			h("div", { ref: layoutHost, class: "workbench-host", "data-testid": "workbench-host" }, [workbench()]),
			h("div", { class: "runtime-row" }, [pane("Runtime", "runtime")]),
			h("output", { class: "evidence", "data-testid": "evidence" }, [
				`layout=${stacked.value ? "stacked" : "split"}; project=${project.value}; sizes=${sizes.value.explorerWidth.toFixed(0)}px/${sizes.value.previewWidth.toFixed(1)}%; RPC writes=${writeCount.value}; last=${lastRpc.value}`,
			]),
		]);
	},
});

createApp(app).mount("#app");

const style = document.createElement("style");
style.textContent = `
	* { box-sizing: border-box; }
	html, body, #app { width: 100%; height: 100%; margin: 0; }
	body { font: 14px/1.4 system-ui, sans-serif; color: #1c2528; background: #f5f7f5; }
	.app { display: grid; grid-template-rows: auto auto minmax(0, 1fr) 110px auto; gap: 8px; height: 100%; padding: 12px; }
	header, .controls { display: flex; align-items: center; gap: 8px; }
	header { justify-content: space-between; }
	button { min-height: 32px; padding: 5px 9px; border: 1px solid #aebbb7; background: white; color: inherit; cursor: pointer; }
	button:focus-visible, [role=separator]:focus-visible { outline: 3px solid #bf5b35; outline-offset: 2px; }
	.workbench-host { min-width: 0; min-height: 0; overflow: hidden; border: 1px solid #82948e; background: white; }
	.splitter-group { display: flex; width: 100%; height: 100%; overflow: hidden; }
	.splitter-panel { min-width: 0; min-height: 0; overflow: hidden; }
	.splitter-handle { position: relative; z-index: 1; flex: 0 0 8px; width: 8px; cursor: col-resize; background: #cbd5d1; }
	.splitter-handle:hover, .splitter-handle:focus-visible { background: #bf5b35; }
	.pane { display: flex; flex-direction: column; min-width: 0; min-height: 0; height: 100%; padding: 14px; overflow: auto; }
	.pane h2 { margin: 0 0 8px; font-size: 15px; }
	.pane p { margin: 0; }
	.explorer { background: #e9efec; }
	.editor { background: #fff; }
	.context { background: #edf0f8; }
	.runtime-row { min-height: 0; border-top: 1px solid #82948e; overflow: auto; }
	.runtime { min-height: 100%; background: #f2eee8; }
	.evidence { padding: 5px 8px; overflow-wrap: anywhere; font: 12px/1.3 ui-monospace, monospace; }
	.focus-workbench, .stacked-workbench { height: 100%; min-height: 0; overflow: auto; }
	.focus-pane { background: #fff; }
	.stacked-workbench { display: grid; grid-template-rows: minmax(72px, 18%) minmax(0, 1fr) minmax(0, 1fr); }
	.stacked-workbench .pane + .pane { border-top: 1px solid #82948e; }
	@media (max-width: 900px) {
		.app { grid-template-rows: auto auto minmax(0, 1fr) 110px auto; }
		.stacked-workbench { grid-template-rows: minmax(72px, 18%) minmax(0, 1fr) minmax(0, 1fr); }
	}
`;
document.head.append(style);