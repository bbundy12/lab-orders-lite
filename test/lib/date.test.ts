import { describe, expect, it } from "vitest";
import { addDays, formatDate, formatDateTime } from "@/lib/date";

describe("date utilities", () => {
  it("adds days to a date", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const result = addDays(start, 5);

    expect(result.toISOString()).toBe("2025-01-06T00:00:00.000Z");
    // ensure original date not mutated
    expect(start.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("formats date inputs", () => {
    const date = new Date("2025-03-15T12:00:00.000Z");
    const formatted = formatDate(date);

    expect(formatted).toBe("Mar 15, 2025");
    expect(formatDate("2025-03-15T12:00:00.000Z")).toBe(formatted);
  });

  it("formats date time inputs", () => {
    const date = new Date("2025-03-15T12:34:00.000Z");
    const formatted = formatDateTime(date);

    expect(formatted).toMatch(/Mar 15, 2025/);
    expect(formatDateTime("2025-03-15T12:34:00.000Z")).toBe(formatted);
  });
});
