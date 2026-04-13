import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock matchMedia for components that use it (though react95 might not)
// idk what gemini was cooking here but  we need it for some reason
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
