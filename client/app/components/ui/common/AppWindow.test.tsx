import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppWindow } from "./AppWindow";
import { EditProvider } from "../../../lib/edit-context";
import * as reactRouter from "react-router";

vi.mock("react-router", () => ({
  useLocation: vi.fn(),
  useNavigate: () => vi.fn(),
}));

vi.mock("@react95/core", async () => {
  const actual = await vi.importActual("@react95/core");
  return {
    ...actual,
    Modal: ({ children, title }: any) => (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    ),
    Tabs: ({ children, defaultActiveTab, onChange }: any) => (
      <div data-testid="tabs" data-active-tab={defaultActiveTab}>
        {children}
      </div>
    ),
    Tab: ({ children, title }: any) => (
      <div data-testid="tab" data-title={title}>
        {children}
      </div>
    ),
    TitleBar: {
      Close: () => <div data-testid="close-button" />,
    },
  };
});

test("AppWindow matches snapshot", () => {
  vi.mocked(reactRouter.useLocation).mockReturnValue({ pathname: "/" } as any);
  const { asFragment } = render(
    <EditProvider>
      <AppWindow children={<div />} dragOptions={{}} isOpen={true} setIsOpen={() => {}} />
    </EditProvider>
  );
  expect(asFragment()).toMatchSnapshot();
});

test("AppWindow shows Editing tab when on edit route", () => {
  vi.mocked(reactRouter.useLocation).mockReturnValue({ pathname: "/edit/1" } as any);
  render(
    <EditProvider>
      <AppWindow children={<div />} dragOptions={{}} isOpen={true} setIsOpen={() => {}} />
    </EditProvider>
  );
  expect(screen.getByTestId("tabs")).toHaveAttribute("data-active-tab", "Editing: ...");
});
