import { describe, it, expect } from "vitest";
import { validateDate, formatISOToDisplay } from "./data";

describe("Edit Route Data Logic", () => {
    describe("validateDate", () => {
        it("should validate and return ISO format for correct MM-DD-YYYY dates", () => {
            expect(validateDate("04-10-2026")).toBe("2026-04-10");
        });

        it("should return null for invalid date formats", () => {
            expect(validateDate("2026-04-10")).toBeNull();
            expect(validateDate("04/10/2026")).toBeNull();
            expect(validateDate("10-04-26")).toBeNull();
        });

        it("should return null for non-existent dates", () => {
            expect(validateDate("02-30-2026")).toBeNull();
            expect(validateDate("13-10-2026")).toBeNull();
        });
    });

    describe("formatISOToDisplay", () => {
        it("should convert ISO date to display format MM-DD-YYYY", () => {
            expect(formatISOToDisplay("2026-04-10")).toBe("04-10-2026");
        });
    });
});
