import type { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/prisma/seed";

export async function resetDatabase(client: PrismaClient = prisma) {
  await client.$transaction(async (tx) => {
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
    await tx.labTest.deleteMany();
    await tx.patient.deleteMany();

    await seedDatabase(tx as Prisma.TransactionClient, { silent: true });
  });
}
