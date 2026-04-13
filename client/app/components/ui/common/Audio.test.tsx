import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import Audio from "./Audio";

test("Audio snapshot", () => {
  const { asFragment } = render(<Audio src="test.mp3" />);
  expect(asFragment()).toMatchSnapshot();
});
