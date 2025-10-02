import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
