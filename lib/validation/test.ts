import { z } from "zod";

export const labTestSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(200),
  priceCents: z.number().int().min(0, "Price must be positive"),
  turnaroundDays: z.number().int().min(1, "Turnaround must be at least 1 day"),
  isActive: z.boolean().default(true),
});

export type LabTestInput = z.infer<typeof labTestSchema>;
