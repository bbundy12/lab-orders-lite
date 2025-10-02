import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create patients
  const patient1 = await prisma.patient.create({
    data: {
      fullName: "Sarah Johnson",
      dob: new Date("1985-06-15"),
      phone: "(555) 123-4567",
      email: "sarah.j@example.com",
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      fullName: "Michael Chen",
      dob: new Date("1992-03-22"),
      phone: "(555) 987-6543",
      email: "mchen@example.com",
    },
  });

  console.log("Created patients:", patient1.fullName, patient2.fullName);

  // Create lab tests
  const test1 = await prisma.labTest.create({
    data: {
      code: "CBC",
      name: "Complete Blood Count",
      priceCents: 4500,
      turnaroundDays: 2,
      isActive: true,
    },
  });

  const test2 = await prisma.labTest.create({
    data: {
      code: "LIPID",
      name: "Lipid Panel",
      priceCents: 6500,
      turnaroundDays: 3,
      isActive: true,
    },
  });

  const test3 = await prisma.labTest.create({
    data: {
      code: "TSH",
      name: "Thyroid Stimulating Hormone",
      priceCents: 5500,
      turnaroundDays: 4,
      isActive: true,
    },
  });

  console.log("Created tests:", test1.code, test2.code, test3.code);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
