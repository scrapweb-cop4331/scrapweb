/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Route from "./route";
import * as reactRouter from "react-router";

// Mock useLoaderData
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

// Mock styled-components which is used by react95
vi.mock("styled-components", () => ({
  default: {
    div: () => "div",
    button: () => "button",
    fieldset: () => "fieldset",
    legend: () => "legend",
    label: () => "label",
    img: () => "img",
    span: () => "span",
  },
  css: () => "",
  createGlobalStyle: () => () => null,
  ThemeProvider: ({ children }: any) => children,
}));

const mockEntries = [
  {
    id: "1",
    date: "2026-04-10",
    imageURL: "/test1.png",
    audioURL: "/audio1.mp3",
    timestamp: 123456,
    isInvalid: false,
  },
  {
    id: "2",
    date: "2025-12-25",
    imageURL: "/test2.png",
    audioURL: "/audio2.mp3",
    timestamp: 123457,
    isInvalid: false,
  },
];

describe("Route Component", () => {
  beforeEach(() => {
    vi.mocked(reactRouter.useLoaderData).mockReturnValue(mockEntries);
  });

  it("renders entries and allows selection", () => {
    render(<Route />);

    const buttons = screen.getAllByRole("button", { name: /2026-04-10|2025-12-25/ });
    expect(buttons).toHaveLength(2);

    // Initial state: Reset Selection should be disabled
    const resetButton = screen.getByText("Reset Selection");
    expect(resetButton).toBeDisabled();

    // Click the first entry
    fireEvent.click(buttons[0]);

    // Reset Selection should now be enabled
    expect(resetButton).not.toBeDisabled();

    // LargeView should be visible (mocked content is "Hello, world" in LargeView.tsx)
    expect(screen.getByText("Hello, world")).toBeInTheDocument();

    // Click the second entry
    fireEvent.click(buttons[1]);
    
    // Reset Selection should still be enabled
    expect(resetButton).not.toBeDisabled();
    expect(screen.getByText("Hello, world")).toBeInTheDocument();

    // Toggle: click the second entry again to de-select
    fireEvent.click(buttons[1]);
    expect(resetButton).toBeDisabled();
    expect(screen.queryByText("Hello, world")).not.toBeInTheDocument();
  });

  it("de-selects when Reset Selection is pressed", () => {
    render(<Route />);

    const buttons = screen.getAllByRole("button", { name: /2026-04-10|2025-12-25/ });
    const resetButton = screen.getByText("Reset Selection");

    // Click an entry
    fireEvent.click(buttons[0]);
    expect(resetButton).not.toBeDisabled();
    expect(screen.queryByText("Hello, world")).toBeInTheDocument();

    // Click reset
    fireEvent.click(resetButton);

    // Should be de-selected
    expect(resetButton).toBeDisabled();
    expect(screen.queryByText("Hello, world")).not.toBeInTheDocument();
  });

  it("filters out invalid entries", () => {
    const mixedEntries = [
      ...mockEntries,
      {
        id: "3",
        date: "Invalid",
        imageURL: "/test3.png",
        audioURL: "/audio3.mp3",
        timestamp: 0,
        isInvalid: true,
      },
    ];
    vi.mocked(reactRouter.useLoaderData).mockReturnValue(mixedEntries);

    render(<Route />);

    const buttons = screen.getAllByRole("button", { name: /2026-04-10|2025-12-25/ });
    expect(buttons).toHaveLength(2); // Only valid ones should render
  });
});
