import { describe, expect, test } from "vitest";
import { KeybindingsManager } from "../src/core/keybindings.js";
import { ResponsePagerComponent } from "../src/modes/interactive/components/response-pager.js";
import { initTheme, theme } from "../src/modes/interactive/theme/theme.js";

function mainViewportLines(rendered: string[]): string[] {
	const liveOutputIndex = rendered.findIndex((line) => line.includes("Live output"));
	return rendered.slice(1, liveOutputIndex);
}

function liveTailLines(rendered: string[]): string[] {
	const liveOutputIndex = rendered.findIndex((line) => line.includes("Live output"));
	return rendered.slice(liveOutputIndex + 1, -1);
}

describe("ResponsePagerComponent", () => {
	test("keeps the main viewport stable while appended lines appear in the live tail", () => {
		initTheme("dark");
		const component = new ResponsePagerComponent(
			["one", "two", "three", "four", "five", "six"],
			true,
			new KeybindingsManager(),
			() => 12,
			theme,
			() => {},
			() => {},
		);

		expect(mainViewportLines(component.render(80))).toEqual(["one", "two", "three", "four", "five"]);

		component.setLines(["one", "two", "three", "four", "five", "six", "seven"], true);
		expect(mainViewportLines(component.render(80))).toEqual(["one", "two", "three", "four", "five"]);
		expect(liveTailLines(component.render(80))).toEqual(["four", "five", "six", "seven"]);

		component.handleInput("j");
		expect(mainViewportLines(component.render(80))).toEqual(["two", "three", "four", "five", "six"]);

		component.setLines(["one", "two", "three", "four", "five", "six", "seven", "eight"], true);
		expect(mainViewportLines(component.render(80))).toEqual(["two", "three", "four", "five", "six"]);
		expect(liveTailLines(component.render(80))).toEqual(["five", "six", "seven", "eight"]);
	});

	test("drops the live tail after streaming ends", () => {
		initTheme("dark");
		const component = new ResponsePagerComponent(
			["one", "two", "three", "four", "five", "six", "seven"],
			true,
			new KeybindingsManager(),
			() => 12,
			theme,
			() => {},
			() => {},
		);

		expect(component.render(80).some((line) => line.includes("Live output"))).toBe(true);

		component.setLines(["one", "two", "three", "four", "five", "six", "seven"], false);
		expect(component.render(80).some((line) => line.includes("Live output"))).toBe(false);
	});
});
