import { test, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Audio from "./Audio";
import React from "react";

vi.mock("@react95/core", async () => {
  const actual = await vi.importActual("@react95/core");
  return {
    ...actual,
    Button: ({ children, onClick, className, 'data-testid': dataTestId }: any) => (
      <button onClick={onClick} className={className} data-testid={dataTestId}>
        {children}
      </button>
    ),
    Range: ({ value, onChange, className, min, max }: any) => (
      <input
        type="range"
        value={value}
        onChange={onChange}
        className={className}
        min={min}
        max={max}
        data-testid="audio-range"
      />
    ),
  };
});

test("Audio matches snapshot", () => {
  const { asFragment } = render(<Audio src="test.mp3" />);
  expect(asFragment()).toMatchSnapshot();
});
