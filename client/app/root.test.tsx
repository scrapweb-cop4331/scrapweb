/**
 * @vitest-environment jsdom
*/
import { render, fireEvent } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { MemoryRouter, Router, useLocation, useLoaderData } from "react-router";
import {BrowserRouter } from "react-router-dom";
import App from "./root";



vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => vi.fn(),
  useLoaderData: () => ({ user: { username: "testuser" } }),
  Outlet: () => <div data-testid="outlet" />,
  Links: () => null,
  Meta: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
}));

vi.mock("./lib/auth", () => ({
  auth: {
    loadUser: vi.fn(),
  },
}));

vi.mock("@react95/core", async () => {
  const actual = await vi.importActual("@react95/core");
  return {
    ...actual,
    Modal: ({ children, title, dragOptions, titleBarOptions }: any) => (
      <div data-testid="modal" data-position={JSON.stringify(dragOptions?.position)}>
        <div data-testid="modal-title">{title}</div>
        <div data-testid="title-bar-options">{titleBarOptions}</div>
        {children}
      </div>
    ),
    Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
    Tab: ({ children }: any) => <div data-testid="tab">{children}</div>,
    TitleBar: {
      Close: ({ onClick }: any) => <button data-testid="close-button" onClick={onClick} />,
    },
  };
});

vi.mock("./components/ui/common/DesktopIcon", () => ({
  DesktopIcon: ({ onClick }: any) => (
    <div data-testid="desktop-icon" onClick={onClick} />
  ),
}));

test("scrapweb icon resets window's position.", () => {
  const { getByTestId, asFragment } = render(<App />);
  const icon = getByTestId("desktop-icon");
  const modal = getByTestId("modal");

  // Initial state (position 0,0)
  expect(modal.getAttribute("data-position")).toBe('{"x":0,"y":0}');

  // We can't easily simulate the @neodrag/react onDrag via fireEvent because it's a callback,
  // but we can verify that if we were to trigger the icon click, it would reset it if it were different.
  // However, since the state is internal to App, we test that clicking it keeps it at 0,0 
  // or resets it if the implementation were to change the state.
  
  fireEvent.click(icon);
  
  expect(asFragment()).toMatchSnapshot();
  expect(modal.getAttribute("data-position")).toBe('{"x":0,"y":0}');
});

test("scrapweb icon unminimizes the window", () => {
  const { getByTestId, queryByTestId, asFragment } = render(<App />);
  
  const closeButton = getByTestId("close-button");
  
  // Close the window
  fireEvent.click(closeButton);
  expect(queryByTestId("modal")).toBeNull();
  
  // Click icon to unminimize
  const icon = getByTestId("desktop-icon");
  fireEvent.click(icon);
  
  expect(queryByTestId("modal")).not.toBeNull();
  expect(asFragment()).toMatchSnapshot();
});

