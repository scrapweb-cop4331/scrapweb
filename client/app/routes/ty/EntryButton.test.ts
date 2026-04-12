import { test, expect } from "vitest";
import EntryButton from "./EntryButton";

test("Entry should match snapshot with default values", () => {
  expect(EntryButton({
  date: '12-24-2025',
  imageURL: '/app/assets/logo_worded.jpg',
  isActive: false,
  onClick:  () => {}
})).toMatchSnapshot();
});
