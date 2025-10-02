import { z } from "zod"

export const orderItemSchema = z.object({
  testId: z.string(),
  unitPriceCents: z.number().int(),
  turnaroundDaysAtOrder: z.number().int(),
})

export const createOrderSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  items: z.array(orderItemSchema).min(1, "At least one test is required"),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "IN_PROGRESS", "READY", "CANCELLED"]),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
