import { describe, it, expect } from "vitest";
import {
  patientSchema,
  updatePatientSchema,
  type PatientInput,
  type UpdatePatientInput,
} from "@/lib/validation/patient";

describe("patient validation", () => {
  describe("valid patient data", () => {
    it("accepts valid complete patient data", () => {
      const validPatient: PatientInput = {
        fullName: "Sarah Johnson",
        dob: "1985-06-15",
        email: "sarah.j@example.com",
        phone: "(555) 123-4567",
      };

      expect(() => patientSchema.parse(validPatient)).not.toThrow();
      const result = patientSchema.parse(validPatient);
      expect(result).toEqual(validPatient);
    });

    it("accepts patient with minimal required fields", () => {
      const minimalPatient: PatientInput = {
        fullName: "John Doe",
        dob: "1990-01-01",
      };

      expect(() => patientSchema.parse(minimalPatient)).not.toThrow();
      const result = patientSchema.parse(minimalPatient);
      expect(result.fullName).toBe("John Doe");
      expect(result.dob).toBe("1990-01-01");
      expect(result.email).toBeUndefined();
      expect(result.phone).toBeUndefined();
    });

    it("accepts empty email and phone as valid", () => {
      const patientWithEmptyOptional: PatientInput = {
        fullName: "Jane Smith",
        dob: "1975-12-25",
        email: "",
        phone: "",
      };

      expect(() => patientSchema.parse(patientWithEmptyOptional)).not.toThrow();
    });
  });

  describe("invalid patient data", () => {
    it("rejects empty fullName", () => {
      const invalidPatient = {
        fullName: "",
        dob: "1990-01-01",
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();

      try {
        patientSchema.parse(invalidPatient);
      } catch (error) {
        const e = error as { errors?: Array<{ message?: string }> };
        expect(e.errors?.[0]?.message).toContain("required");
      }
    });

    it("rejects missing fullName", () => {
      const invalidPatient = {
        dob: "1990-01-01",
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();
    });

    it("rejects invalid date format", () => {
      const invalidPatient = {
        fullName: "John Doe",
        dob: "not-a-date",
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();

      try {
        patientSchema.parse(invalidPatient);
      } catch (error) {
        const e = error as { errors?: Array<{ message?: string }> };
        expect(e.errors?.[0]?.message).toContain("Invalid date format");
      }
    });

    it("rejects invalid email format", () => {
      const invalidPatient = {
        fullName: "John Doe",
        dob: "1990-01-01",
        email: "not-an-email",
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();

      try {
        patientSchema.parse(invalidPatient);
      } catch (error) {
        const e = error as { errors?: Array<{ message?: string }> };
        expect(e.errors?.[0]?.message).toContain("Invalid email");
      }
    });

    it("rejects too long fullName", () => {
      const invalidPatient = {
        fullName: "A".repeat(101), // Over 100 character limit
        dob: "1990-01-01",
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();

      try {
        patientSchema.parse(invalidPatient);
      } catch (error) {
        const e = error as { errors?: Array<{ message?: string }> };
        expect(e.errors?.[0]?.message).toContain("100");
      }
    });

    it("requires dob field", () => {
      const invalidPatient = {
        fullName: "John Doe",
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();
    });
  });

  describe("edge cases", () => {
    it("accepts exactly 100 character fullName", () => {
      const patientWithLongName = {
        fullName: "A".repeat(100),
        dob: "1990-01-01",
      };

      expect(() => patientSchema.parse(patientWithLongName)).not.toThrow();
    });

    it("accepts various valid date formats", () => {
      const validDates = [
        "1990-01-01",
        "2000-12-31",
        "1950-06-15",
        "2024-02-29", // Leap year
      ];

      validDates.forEach((date) => {
        const patient = {
          fullName: "John Doe",
          dob: date,
        };

        expect(() => patientSchema.parse(patient)).not.toThrow();
      });
    });

    it("accepts various valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "test.email+tag@domain.co.uk",
        "user123@subdomain.example.org",
      ];

      validEmails.forEach((email) => {
        const patient = {
          fullName: "John Doe",
          dob: "1990-01-01",
          email,
        };

        expect(() => patientSchema.parse(patient)).not.toThrow();
      });
    });

    it("accepts valid phone format", () => {
      const patient = {
        fullName: "John Doe",
        dob: "1990-01-01",
        phone: "(555) 123-4567",
      };

      expect(() => patientSchema.parse(patient)).not.toThrow();
    });

    it("rejects phone numbers in unsupported formats", () => {
      const invalidPhones = ["555-123-4567", "555.123.4567", "5551234567", "+1 (555) 123-4567"];

      invalidPhones.forEach((phone) => {
        const patient = {
          fullName: "John Doe",
          dob: "1990-01-01",
          phone,
        };

        expect(() => patientSchema.parse(patient)).toThrow();
      });
    });
  });
});

describe("updatePatientSchema", () => {
  it("allows partial updates with valid fields", () => {
    const update: UpdatePatientInput = {
      id: "patient-1",
      email: "new@example.com",
    };

    expect(() => updatePatientSchema.parse(update)).not.toThrow();
  });

  it("converts empty strings to allow clearing optional fields", () => {
    const update: UpdatePatientInput = {
      id: "patient-1",
      email: "",
      phone: "",
    };

    const parsed = updatePatientSchema.parse(update);
    expect(parsed.email).toBe("");
    expect(parsed.phone).toBe("");
  });

  it("rejects payloads without fields besides id", () => {
    const update = {
      id: "patient-1",
    };

    expect(() => updatePatientSchema.parse(update)).toThrow(/No fields provided/);
  });

  it("validates provided fields", () => {
    const update = {
      id: "patient-1",
      email: "not-an-email",
    };

    expect(() => updatePatientSchema.parse(update)).toThrow();
  });

  it("requires id", () => {
    const update = {
      email: "user@example.com",
    };

    expect(() => updatePatientSchema.parse(update)).toThrow();
  });
});
