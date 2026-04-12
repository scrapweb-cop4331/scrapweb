import { test, expect, vi } from "vitest";
import { AppWindow } from "./AppWindow";

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
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
    Tabs: ({ children, activeTab, onChange }: any) => (
      <div data-testid="tabs" data-active-tab={activeTab}>
        {children}
      </div>
    ),
    Tab: ({ children, value, label }: any) => (
      <div data-testid="tab" data-value={value} data-label={label}>
        {children}
      </div>
    ),
  };
});

test("AppWindow matches snapshot", () => {
  expect(AppWindow({ children: <div />, isOpen: true, setIsOpen: () => {} })).toMatchSnapshot();
});
