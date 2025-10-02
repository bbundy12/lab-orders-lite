import { z } from "zod"

export const patientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
})

export type PatientInput = z.infer<typeof patientSchema>
