import { vi } from "vitest";

export const prismaMock = {
  order: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  patient: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  labTest: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

export function resetPrismaMock() {
  prismaMock.order.findMany.mockReset();
  prismaMock.order.findUnique.mockReset();
  prismaMock.order.create.mockReset();
  prismaMock.order.update.mockReset();
  prismaMock.patient.findMany.mockReset();
  prismaMock.patient.create.mockReset();
  prismaMock.patient.update.mockReset();
  prismaMock.labTest.findMany.mockReset();
  prismaMock.labTest.create.mockReset();
  prismaMock.labTest.update.mockReset();
}
