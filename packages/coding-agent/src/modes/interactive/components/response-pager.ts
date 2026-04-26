import type { Component } from "@mariozechner/pi-tui";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { KeybindingsManager } from "../../../core/keybindings.js";
import type { Theme } from "../theme/theme.js";
import { keyText } from "./keybinding-hints.js";

export class ResponsePagerComponent implements Component {
	private scrollOffset = 0;

	constructor(
		private readonly lines: string[],
		private readonly keybindings: KeybindingsManager,
		private readonly getTerminalRows: () => number,
		private readonly theme: Theme,
		private readonly onClose: () => void,
		private readonly onChange: () => void,
	) {}

	render(width: number): string[] {
		const height = Math.max(5, this.getTerminalRows());
		const contentHeight = Math.max(1, height - 3);
		const maxOffset = Math.max(0, this.lines.length - contentHeight);
		this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, maxOffset));

		const start = this.scrollOffset;
		const end = Math.min(this.lines.length, start + contentHeight);
		const visible = this.lines.slice(start, end).map((line) => this.fitLine(line, width));
		while (visible.length < contentHeight) {
			visible.push("");
		}

		const position = `${Math.min(end, this.lines.length)}/${this.lines.length}`;
		const title = ` Response pager ${position} `;
		const help = [
			`${keyText("app.pager.lineUp")}/${keyText("app.pager.lineDown")} line`,
			`${keyText("app.pager.pageUp")}/${keyText("app.pager.pageDown")} page`,
			`${keyText("app.pager.close")} close`,
			`${keyText("app.pager.continue")} continue`,
		].join(" · ");

		return [
			this.fitLine(this.theme.fg("accent", this.theme.bold(title)), width),
			...visible,
			this.fitLine(this.theme.fg("dim", help), width),
		];
	}

	handleInput(data: string): void {
		const pageSize = Math.max(1, this.getTerminalRows() - 4);
		if (this.keybindings.matches(data, "app.pager.close") || this.keybindings.matches(data, "app.pager.continue")) {
			this.onClose();
			return;
		}
		if (this.keybindings.matches(data, "app.pager.lineUp")) {
			this.scrollBy(-1);
			return;
		}
		if (this.keybindings.matches(data, "app.pager.lineDown")) {
			this.scrollBy(1);
			return;
		}
		if (this.keybindings.matches(data, "app.pager.pageUp")) {
			this.scrollBy(-pageSize);
			return;
		}
		if (this.keybindings.matches(data, "app.pager.pageDown")) {
			this.scrollBy(pageSize);
		}
	}

	invalidate(): void {}

	private scrollBy(delta: number): void {
		const contentHeight = Math.max(1, this.getTerminalRows() - 3);
		const maxOffset = Math.max(0, this.lines.length - contentHeight);
		const nextOffset = Math.max(0, Math.min(this.scrollOffset + delta, maxOffset));
		if (nextOffset === this.scrollOffset) return;
		this.scrollOffset = nextOffset;
		this.onChange();
	}

	private fitLine(line: string, width: number): string {
		if (visibleWidth(line) <= width) return line;
		return truncateToWidth(line, width, "");
	}
}
