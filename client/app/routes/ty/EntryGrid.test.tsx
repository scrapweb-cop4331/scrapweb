import { test, expect, vi } from "vitest";
import { EntryGrid } from "./EntryGrid";

vi.mock("./EntryButton", () => ({
  default: ({ date, imageURL }: any) => (
    <div>
      <img src={imageURL} alt={date} />
      <span>{date}</span>
    </div>
  ),
}));

test("renders children correctly", () => {
  const children = (
    <div data-testid="test-child">Test Child</div>
  );
  
  
  expect(EntryGrid({ children })).toMatchSnapshot();
});

test("Integration style check: can render mocked EntryButtons as children", () => {
  const mockEntries = [
    { id: "1", date: "2026-04-10", imageURL: "/test.png" }
  ];

  const children = mockEntries.map(entry => (
    <div key={entry.id}>
      <img src={entry.imageURL} alt={entry.date} />
      <span>{entry.date}</span>
    </div>
  ));

  expect(EntryGrid({ children })).toMatchSnapshot();
});
