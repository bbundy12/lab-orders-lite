import { describe, it, expect } from "vitest";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
} from "@/lib/validation/order";

describe("order validation", () => {
  describe("createOrderSchema", () => {
    describe("valid order data", () => {
      it("accepts valid complete order", () => {
        const validOrder: CreateOrderInput = {
          patientId: "patient123",
          items: [
            {
              labTestId: "test1",
              unitPriceCents: 1500,
              turnaroundDaysAtOrder: 2,
            },
            {
              labTestId: "test2",
              unitPriceCents: 2500,
              turnaroundDaysAtOrder: 3,
            },
          ],
        };

        expect(() => createOrderSchema.parse(validOrder)).not.toThrow();
      });

      it("accepts order with single item", () => {
        const singleItemOrder: CreateOrderInput = {
          patientId: "patient123",
          items: [
            {
              labTestId: "test1",
              unitPriceCents: 1500,
              turnaroundDaysAtOrder: 2,
            },
          ],
        };

        expect(() => createOrderSchema.parse(singleItemOrder)).not.toThrow();
      });
    });

    describe("invalid order data", () => {
      it("rejects empty patientId", () => {
        const invalidOrder = {
          patientId: "",
          items: [
            {
              labTestId: "test1",
              unitPriceCents: 1500,
              turnaroundDaysAtOrder: 2,
            },
          ],
        };

        expect(() => createOrderSchema.parse(invalidOrder)).toThrow();
      });

      it("rejects empty items array", () => {
        const invalidOrder = {
          patientId: "patient123",
          items: [],
        };

        expect(() => createOrderSchema.parse(invalidOrder)).toThrow();
      });
    });
  });

  describe("updateOrderStatusSchema", () => {
    it("accepts valid status updates", () => {
      const validStatuses: UpdateOrderStatusInput["status"][] = [
        "DRAFT",
        "SUBMITTED",
        "IN_PROGRESS",
        "READY",
        "CANCELLED",
      ];

      validStatuses.forEach((status) => {
        const validUpdate: UpdateOrderStatusInput = { status };
        expect(() => updateOrderStatusSchema.parse(validUpdate)).not.toThrow();
      });
    });

    it("rejects invalid status values", () => {
      const invalidUpdate = { status: "INVALID_STATUS" };
      expect(() => updateOrderStatusSchema.parse(invalidUpdate)).toThrow();
    });

    it("rejects missing status field", () => {
      expect(() => updateOrderStatusSchema.parse({} as UpdateOrderStatusInput)).toThrow();
    });
  });
});
