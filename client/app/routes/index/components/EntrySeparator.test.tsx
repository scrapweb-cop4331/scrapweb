import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EntrySeparator } from "./EntrySeparator";

describe("EntrySeparator", () => {
  it("renders a month separator correctly", () => {
    const { asFragment } = render(<EntrySeparator type="month" label="April" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a year separator correctly", () => {
    const { asFragment } = render(<EntrySeparator type="year" label="2026" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
