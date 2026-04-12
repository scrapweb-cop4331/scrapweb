/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Route, { loader } from "./route";
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

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEntries = [
  {
    id: "1",
    date: "04-10-2026",
    imageURL: "/test1.png",
    audioURL: "/audio1.mp3",
    timestamp: 20260410,
    isInvalid: false,
  },
  {
    id: "2",
    date: "12-25-2025",
    imageURL: "/test2.png",
    audioURL: "/audio2.mp3",
    timestamp: 20251225,
    isInvalid: false,
  },
];

describe("Route Component", () => {
  beforeEach(() => {
    vi.mocked(reactRouter.useLoaderData).mockReturnValue(mockEntries);
    mockFetch.mockReset();
  });

  it("renders entries and allows selection", () => {
    render(<Route />);

    const buttons = screen.getAllByRole("button", { name: /04-10-2026|12-25-2025/ });
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

    const buttons = screen.getAllByRole("button", { name: /04-10-2026|12-25-2025/ });
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

    const buttons = screen.getAllByRole("button", { name: /04-10-2026|12-25-2025/ });
    expect(buttons).toHaveLength(2); // Only valid ones should render
  });

  it("shows no entries message when empty", () => {
    vi.mocked(reactRouter.useLoaderData).mockReturnValue([]);

    render(<Route />);

    expect(screen.getByText("No entries found.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /04-10-2026|12-25-2025/ })).not.toBeInTheDocument();
  });

  describe("loader", () => {
    it("fetches and maps media data correctly", async () => {
      const mockMediaData = {
        media: [
          {
            _id: "1",
            audio: "/audio1.mp3",
            photo: "/photo1.jpg",
            notes: "Note 1",
            date: "2026-04-10",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMediaData,
      });

      const result = await loader();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://137.184.93.240/api/media",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer "),
          }),
        })
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: "1",
          imageURL: "http://137.184.93.240/photo1.jpg",
          date: "04-10-2026",
          timestamp: 20260410,
        })
      );
    });

    it("returns empty array when fetch response is not ok", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await loader();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch media data");
      consoleErrorSpy.mockRestore();
    });

    it("returns empty array and logs error on fetch exception", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Network error");
      mockFetch.mockRejectedValueOnce(error);

      const result = await loader();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading media:", error);
      consoleErrorSpy.mockRestore();
    });
  });
});
