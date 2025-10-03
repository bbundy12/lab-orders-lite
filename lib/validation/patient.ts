import { z } from "zod";

// Phone number regex for US format: (XXX) XXX-XXXX
const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

const basePatientSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid phone number in format (XXX) XXX-XXXX")
    .optional()
    .or(z.literal("")),
});

export const patientSchema = basePatientSchema;

export const updatePatientSchema = basePatientSchema
  .partial()
  .extend({
    id: z.string().min(1, "Patient ID is required"),
  })
  .superRefine((data, ctx) => {
    const { id, ...rest } = data;
    if (!id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Patient ID is required",
        path: ["id"],
      });
    }

    if (Object.keys(rest).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No fields provided for update",
        path: [],
      });
    }
  });

export type PatientInput = z.infer<typeof patientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
