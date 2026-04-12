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

// Mock react95 components
vi.mock("@react95/core", async () => {
  return {
    Modal: ({ children, title, className }: any) => (
      <div data-testid="modal" className={className}>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    ),
    Button: ({ children, onClick, disabled, className }: any) => (
      <button onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    ),
    Frame: ({ children, className, as: Component = "div", onClick }: any) => (
      <Component className={className} onClick={onClick}>
        {children}
      </Component>
    ),
    Fieldset: ({ children, legend, className }: any) => (
      <fieldset className={className}>
        <legend>{legend}</legend>
        {children}
      </fieldset>
    ),
  };
});

// Mock react95 icons
vi.mock("@react95/icons", () => ({
  Computer: () => <div data-testid="computer-icon" />,
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

    // Placeholder should be visible when no selection
    expect(screen.getByText("Select an entry to view details")).toBeInTheDocument();

    // Click the first entry
    fireEvent.click(buttons[0]);

    // LargeView should be visible
    expect(screen.getByText("Hello, world")).toBeInTheDocument();
    expect(screen.queryByText("Select an entry to view details")).not.toBeInTheDocument();
  });

  it("de-selects when the same button is pressed", () => {
    render(<Route />);

    const buttons = screen.getAllByRole("button", { name: /04-10-2026|12-25-2025/ });
    const resetButton = screen.getByText("Reset Selection");

    // Click an entry
    fireEvent.click(buttons[0]);
    expect(screen.queryByText("Hello, world")).toBeInTheDocument();

    // Click reset
    fireEvent.click(buttons[0]);

    // Should be de-selected
    expect(resetButton).toBeDisabled();
    expect(screen.getByText("Select an entry to view details")).toBeInTheDocument();
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

  it("renders year and month separators", () => {
    const multiPeriodEntries = [
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
        date: "03-15-2026",
        imageURL: "/test2.png",
        audioURL: "/audio2.mp3",
        timestamp: 20260315,
        isInvalid: false,
      },
      {
        id: "3",
        date: "12-25-2025",
        imageURL: "/test3.png",
        audioURL: "/audio3.mp3",
        timestamp: 20251225,
        isInvalid: false,
      },
    ];
    vi.mocked(reactRouter.useLoaderData).mockReturnValue(multiPeriodEntries);

    render(<Route />);

    // Check for year separators
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();

    // Check for month separators
    expect(screen.getByText("April")).toBeInTheDocument();
    expect(screen.getByText("March")).toBeInTheDocument();
    expect(screen.getByText("December")).toBeInTheDocument();
  });

  it("shows no entries message when empty", () => {
    vi.mocked(reactRouter.useLoaderData).mockReturnValue([]);

    render(<Route />);

    expect(screen.getByText("No entries found.")).toBeInTheDocument();
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
      
      //todo it should also check for audio. DO NOT IMPLEMENT UNLESS USER REQUESTS A FIX ON TODOS
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
  });
});
