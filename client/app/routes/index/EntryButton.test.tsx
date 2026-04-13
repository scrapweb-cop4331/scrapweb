import { test, expect, vi } from "vitest";
import EntryButton from "./EntryButton";
import { useLocation } from "react-router";
import { useState } from "react";

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

