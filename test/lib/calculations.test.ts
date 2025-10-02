import { describe, it, expect } from "vitest";
import { calcTotal, calcEta, formatMoney } from "@/lib/calculations";

describe("calculations", () => {
  describe("calcTotal", () => {
    it("calculates total correctly with multiple items", () => {
      const items = [
        { unitPriceCents: 4500, turnaroundDaysAtOrder: 2 },
        { unitPriceCents: 6500, turnaroundDaysAtOrder: 3 },
        { unitPriceCents: 2500, turnaroundDaysAtOrder: 1 },
      ];

      expect(calcTotal(items)).toBe(13500); // 4500 + 6500 + 2500
    });

    it("returns 0 for empty array", () => {
      expect(calcTotal([])).toBe(0);
    });

    it("returns single item price", () => {
      const items = [{ unitPriceCents: 1500, turnaroundDaysAtOrder: 2 }];
      expect(calcTotal(items)).toBe(1500);
    });

    it("handles zero priced items", () => {
      const items = [
        { unitPriceCents: 0, turnaroundDaysAtOrder: 1 },
        { unitPriceCents: 5000, turnaroundDaysAtOrder: 2 },
        { unitPriceCents: 0, turnaroundDaysAtOrder: 3 },
      ];

      expect(calcTotal(items)).toBe(5000);
    });
  });

  describe("calcEta", () => {
    it("returns correct ETA with multiple turnaround days", () => {
      const placedAt = new Date("2024-01-01T10:00:00Z");
      const items = [
        { unitPriceCents: 1000, turnaroundDaysAtOrder: 2 }, // shortest
        { unitPriceCents: 2000, turnaroundDaysAtOrder: 5 }, // longest
        { unitPriceCents: 3000, turnaroundDaysAtOrder: 3 },
      ];

      const result = calcEta(placedAt, items);
      const expected = new Date("2024-01-06T10:00:00Z"); // Jan 1 + 5 days

      expect(result.toISOString()).toBe(expected.toISOString());
    });

    it("returns correct ETA with single item", () => {
      const placedAt = new Date("2024-02-15T14:30:00Z");
      const items = [{ unitPriceCents: 1000, turnaroundDaysAtOrder: 3 }];

      const result = calcEta(placedAt, items);
      const expected = new Date("2024-02-18T14:30:00Z"); // Feb 15 + 3 days

      expect(result.toISOString()).toBe(expected.toISOString());
    });

    it("handles single day turnaround", () => {
      const placedAt = new Date("2024-03-10T09:15:00Z");
      const items = [{ unitPriceCents: 1000, turnaroundDaysAtOrder: 1 }];

      const result = calcEta(placedAt, items);
      const expected = new Date("2024-03-11T09:15:00Z"); // Mar 10 + 1 day

      expect(result.toISOString()).toBe(expected.toISOString());
    });

    it("handles same turnaround days", () => {
      const placedAt = new Date("2024-04-20T12:00:00Z");
      const items = [
        { unitPriceCents: 1000, turnaroundDaysAtOrder: 4 },
        { unitPriceCents: 2000, turnaroundDaysAtOrder: 4 },
        { unitPriceCents: 3000, turnaroundDaysAtOrder: 4 },
      ];

      const result = calcEta(placedAt, items);
      const expected = new Date("2024-04-24T12:00:00Z"); // Apr 20 + 4 days

      expect(result.toISOString()).toBe(expected.toISOString());
    });

    it("handles empty array gracefully", () => {
      const placedAt = new Date("2024-05-01T08:00:00Z");
      const items: Array<{ unitPriceCents: number; turnaroundDaysAtOrder: number }> = [];

      const result = calcEta(placedAt, items);
      const expected = new Date("2024-05-01T08:00:00Z"); // No change

      expect(result.toISOString()).toBe(expected.toISOString());
    });
  });

  describe("formatMoney", () => {
    it("formats cents to currency correctly", () => {
      expect(formatMoney(1250)).toBe("$12.50");
      expect(formatMoney(10000)).toBe("$100.00");
      expect(formatMoney(450)).toBe("$4.50");
    });

    it("handles zero amount", () => {
      expect(formatMoney(0)).toBe("$0.00");
    });

    it("handles single digit cents", () => {
      expect(formatMoney(1)).toBe("$0.01");
      expect(formatMoney(9)).toBe("$0.09");
    });

    it("handles large amounts", () => {
      expect(formatMoney(999999)).toBe("$9,999.99");
      expect(formatMoney(1000000)).toBe("$10,000.00");
    });

    it("handles smaller amounts", () => {
      expect(formatMoney(10)).toBe("$0.10");
      expect(formatMoney(99)).toBe("$0.99");
    });

    it("formats with proper US locale settings", () => {
      // Test with various amounts to ensure consistency
      const testCases = [
        { cents: 1234, expected: "$12.34" },
        { cents: 5678, expected: "$56.78" },
        { cents: 100, expected: "$1.00" },
        { cents: 50, expected: "$0.50" },
      ];

      testCases.forEach(({ cents, expected }) => {
        expect(formatMoney(cents)).toBe(expected);
      });
    });
  });
});
