export interface ShellCommand {
	id: string;
	label: string;
	shortcut?: string;
	enabled: boolean;
	disabledReason?: string;
	run(): void | Promise<void>;
}

export type ShellFocusMode = "none" | "editor" | "preview";
export type ShellTheme = "system" | "light" | "dark";
export type DrawerDock = "bottom" | "right";