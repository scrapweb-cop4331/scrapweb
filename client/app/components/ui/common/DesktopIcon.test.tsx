import { test, expect } from "vitest";
import { DesktopIcon } from "./DesktopIcon";

test("DesktopIcon matches snapshot", () => {
  expect(DesktopIcon({ onClick: () => {} })).toMatchSnapshot();
});
