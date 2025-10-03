import { PrismaClient, Prisma } from "@prisma/client";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

type SeedClient = PrismaClient | Prisma.TransactionClient;

export async function seedDatabase(client: SeedClient, { silent = false } = {}) {
  const patient1 = await client.patient.create({
    data: {
      fullName: "Sarah Johnson",
      dob: new Date("1985-06-15"),
      phone: "(555) 123-4567",
      email: "sarah.j@example.com",
    },
  });

  const patient2 = await client.patient.create({
    data: {
      fullName: "Michael Chen",
      dob: new Date("1992-03-22"),
      phone: "(555) 987-6543",
      email: "mchen@example.com",
    },
  });

  await client.labTest.createMany({
    data: [
      {
        code: "CBC",
        name: "Complete Blood Count",
        priceCents: 4500,
        turnaroundDays: 2,
        isActive: true,
      },
      {
        code: "LIPID",
        name: "Lipid Panel",
        priceCents: 6500,
        turnaroundDays: 3,
        isActive: true,
      },
      {
        code: "TSH",
        name: "Thyroid Stimulating Hormone",
        priceCents: 5500,
        turnaroundDays: 4,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  if (!silent) {
    console.log("Created patients:", patient1.fullName, patient2.fullName);
    console.log("Created lab tests: CBC, LIPID, TSH");
  }
}

async function main() {
  const prisma = new PrismaClient();

  try {
    await seedDatabase(prisma);
    console.log("Seeding complete!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const directExecutionCandidate = process.argv[1];

if (directExecutionCandidate) {
  const modulePath = fileURLToPath(import.meta.url);
  const executedPath = resolve(directExecutionCandidate);

  if (modulePath === executedPath) {
    void main();
  }
}
