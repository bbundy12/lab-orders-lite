import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "@/prisma/seed";

export default async function globalSetup() {
  execSync("pnpm prisma migrate reset --force --skip-generate --skip-seed", {
    stdio: "inherit",
  });

  const prisma = new PrismaClient();

  try {
    await seedDatabase(prisma, { silent: true });
  } finally {
    await prisma.$disconnect();
  }
}
