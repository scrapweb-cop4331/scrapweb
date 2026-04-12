import { test, expect } from "vitest";
import EntryButton from "./EntryButton";

test("entry is unpressed", () => {
  expect(EntryButton({
  date: '12-24-2025',
  imageURL: '/app/assets/logo_worded.jpg',
  isActive: false,
  onClick:  () => {}
})).toMatchSnapshot();
});

test("entry is pressed", () => {
  expect(
    EntryButton({
      date: "12-24-2025",
      imageURL: "/app/assets/logo_worded.jpg",
      isActive: true,
      onClick: () => {},
    }),
  ).toMatchSnapshot();
});