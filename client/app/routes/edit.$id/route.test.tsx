import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditRoute from "./route";
import * as reactRouter from "react-router";
import { EditProvider } from "../../lib/edit-context";

// Mock react-router
vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useLoaderData: vi.fn(),
        useNavigate: vi.fn(),
        useParams: vi.fn(),
    };
});

// Mock auth
vi.mock("../../lib/auth", () => ({
    auth: {
        getToken: vi.fn().mockReturnValue("test-token"),
        loadUser: vi.fn().mockReturnValue({ token: "test-token" }),
    },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const originalLocation = window.location;
// @ts-ignore
delete window.location;
window.location = { 
    ...originalLocation, 
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
} as any;

// Mock react95 components
vi.mock("@react95/core", async () => {
    return {
        Button: ({ children, onClick, disabled, className }: any) => (
            <button onClick={onClick} disabled={disabled} className={className} data-testid={className}>
                {children}
            </button>
        ),
        Input: ({ value, onChange, placeholder, type }: any) => (
            <input 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
                type={type} 
                data-testid={placeholder || type} 
                defaultValue={value}
            />
        ),
        TextArea: ({ value, onChange, placeholder }: any) => (
            <textarea 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
                data-testid={placeholder} 
                defaultValue={value}
            />
        ),
        Alert: ({ title, message, type, closeAlert, buttons }: any) => (
            <div data-testid="alert">
                <h3>{title}</h3>
                <p>{message}</p>
                {buttons.map((btn: any) => (
                    <button key={btn.value} onClick={() => btn.onClick({} as any)}>
                        {btn.value}
                    </button>
                ))}
            </div>
        ),
    };
});

const mockEntry = {
    id: "1",
    date: "04-10-2026",
    note: "Original Note",
    imageURL: "/test.png",
    audioURL: "/audio.mp3",
};

describe("Edit Route Component", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.mocked(reactRouter.useLoaderData).mockReturnValue(mockEntry);
        vi.mocked(reactRouter.useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(reactRouter.useParams).mockReturnValue({ id: "1" });
        mockFetch.mockReset();
        vi.clearAllMocks();
    });

    it("renders with initial data", () => {
        render(
            <EditProvider>
                <EditRoute />
            </EditProvider>
        );
        expect(screen.getByDisplayValue("Original Note")).toBeInTheDocument();
        expect(screen.getByDisplayValue("04-10-2026")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeDisabled();
    });

    it("enables Save button when a field is edited", () => {
        render(
            <EditProvider>
                <EditRoute />
            </EditProvider>
        );
        const noteInput = screen.getByDisplayValue("Original Note");
        fireEvent.change(noteInput, { target: { value: "Updated Note" } });
        expect(screen.getByText("Save")).not.toBeDisabled();
    });

    it("matches snapshot in read-only and edit view", () => {
        const { asFragment } = render(
            <EditProvider>
                <EditRoute />
            </EditProvider>
        );
        expect(asFragment()).toMatchSnapshot("read-only");

        const noteInput = screen.getByDisplayValue("Original Note");
        fireEvent.change(noteInput, { target: { value: "Updated Note" } });
        expect(asFragment()).toMatchSnapshot("edit-view");
    });

    it("calls API on save", async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });
        render(
            <EditProvider>
                <EditRoute />
            </EditProvider>
        );
        
        const noteInput = screen.getByDisplayValue("Original Note");
        fireEvent.change(noteInput, { target: { value: "Updated Note" } });
        
        const saveButton = screen.getByText("Save");
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/1"),
                expect.objectContaining({
                    method: "PATCH",
                })
            );
        });
    });

    it("shows alert when closing with pending changes", () => {
        render(
            <EditProvider>
                <EditRoute />
            </EditProvider>
        );
        const noteInput = screen.getByDisplayValue("Original Note");
        fireEvent.change(noteInput, { target: { value: "Updated Note" } });
        
        const closeButton = screen.getByText("Close");
        fireEvent.click(closeButton);

        expect(screen.getByTestId("alert")).toBeInTheDocument();
        expect(screen.getByText(/pending changes/i)).toBeInTheDocument();
    });
});
