import { describe, it, expect } from "vitest";
import { labTestSchema, type LabTestInput } from "@/lib/validation/test";

describe("labTest validation", () => {
  describe("valid lab test data", () => {
    it("accepts valid complete lab test data", () => {
      const validLabTest: LabTestInput = {
        code: "CBC",
        name: "Complete Blood Count",
        priceCents: 4500,
        turnaroundDays: 2,
        isActive: true,
      };

      expect(() => labTestSchema.parse(validLabTest)).not.toThrow();
      const result = labTestSchema.parse(validLabTest);
      expect(result).toEqual(validLabTest);
    });

    it("accepts lab test with default isActive", () => {
      const labTestWithoutActive: LabTestInput = {
        code: "LIPID",
        name: "Lipid Panel",
        priceCents: 6500,
        turnaroundDays: 3,
      };

      expect(() => labTestSchema.parse(labTestWithoutActive)).not.toThrow();
      const result = labTestSchema.parse(labTestWithoutActive);
      expect(result.isActive).toBe(true); // Default value
    });

    it("accepts minimal required fields", () => {
      const minimalLabTest = {
        code: "TSH",
        name: "Thyroid Stimulating Hormone",
        priceCents: 5500,
        turnaroundDays: 4,
      };

      expect(() => labTestSchema.parse(minimalLabTest)).not.toThrow();
    });
  });

  describe("invalid lab test data", () => {
    it("rejects empty code", () => {
      const invalidLabTest = {
        code: "",
        name: "Test Name",
        priceCents: 1000,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(invalidLabTest)).toThrow();

      try {
        labTestSchema.parse(invalidLabTest);
      } catch (error) {
        expect(error.errors?.[0]?.message).toContain("required");
      }
    });

    it("rejects empty name", () => {
      const invalidLabTest = {
        code: "ABC",
        name: "",
        priceCents: 1000,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(invalidLabTest)).toThrow();
    });

    it("rejects negative price", () => {
      const invalidLabTest = {
        code: "ABC",
        name: "Test Name",
        priceCents: -100,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(invalidLabTest)).toThrow();

      try {
        labTestSchema.parse(invalidLabTest);
      } catch (error) {
        expect(error.errors?.[0]?.message).toContain("positive");
      }
    });

    it("rejects zero or negative turnaround days", () => {
      const invalidLabTest = {
        code: "ABC",
        name: "Test Name",
        priceCents: 1000,
        turnaroundDays: 0,
      };

      expect(() => labTestSchema.parse(invalidLabTest)).toThrow();

      try {
        labTestSchema.parse(invalidLabTest);
      } catch (error) {
        expect(error.errors?.[0]?.message).toContain("at least 1");
      }
    });

    it("rejects non-integer price", () => {
      const invalidLabTest = {
        code: "ABC",
        name: "Test Name",
        priceCents: 99.99, // Should be integer
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(invalidLabTest)).toThrow();
    });

    it("rejects non-integer turnaround days", () => {
      const invalidLabTest = {
        code: "ABC",
        name: "Test Name",
        priceCents: 1000,
        turnaroundDays: 1.5, // Should be integer
      };

      expect(() => labTestSchema.parse(invalidLabTest)).toThrow();
    });
  });

  describe("edge cases", () => {
    it("accepts exactly 20 character code", () => {
      const labTestWithLongCode = {
        code: "A".repeat(20),
        name: "Test Name",
        priceCents: 1000,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(labTestWithLongCode)).not.toThrow();
    });

    it("accepts exactly 200 character name", () => {
      const labTestWithLongName = {
        code: "ABC",
        name: "A".repeat(200),
        priceCents: 1000,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(labTestWithLongName)).not.toThrow();
    });

    it("accepts zero price", () => {
      const freeLabTest = {
        code: "FREE",
        name: "Free Test",
        priceCents: 0,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(freeLabTest)).not.toThrow();
    });

    it("accepts large turnaround days", () => {
      const longTurnaroundTest = {
        code: "SLOW",
        name: "Slow Test",
        priceCents: 1000,
        turnaroundDays: 30,
      };

      expect(() => labTestSchema.parse(longTurnaroundTest)).not.toThrow();
    });

    it("accepts single day turnaround", () => {
      const quickTest = {
        code: "FAST",
        name: "Quick Test",
        priceCents: 1000,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(quickTest)).not.toThrow();
    });
  });

  describe("validation boundaries", () => {
    it("rejects code over 20 characters", () => {
      const labTestWithTooLongCode = {
        code: "A".repeat(21),
        name: "Test Name",
        priceCents: 1000,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(labTestWithTooLongCode)).toThrow();
    });

    it("rejects name over 200 characters", () => {
      const labTestWithTooLongName = {
        code: "ABC",
        name: "A".repeat(201),
        priceCents: 1000,
        turnaroundDays: 1,
      };

      expect(() => labTestSchema.parse(labTestWithTooLongName)).toThrow();
    });

    it("accepts isActive boolean values", () => {
      const activeTest = { ...validData, isActive: true };
      const inactiveTest = { ...validData, isActive: false };

      expect(() => labTestSchema.parse(activeTest)).not.toThrow();
      expect(() => labTestSchema.parse(inactiveTest)).not.toThrow();
    });
  });

  const validData = {
    code: "ABC",
    name: "Test Name",
    priceCents: 1000,
    turnaroundDays: 1,
  };
});
