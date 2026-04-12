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
  expect(AppWindow({ children: <div />, isOpen: true, setIsOpen: () => {} })).toMatchSnapshot();
});
