import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to populate users table...");

  // Create users in batches to avoid memory issues
  const batchSize = 100;
  const totalUsers = 1000;

  for (let i = 0; i < totalUsers; i += batchSize) {
    const usersToCreate = [];

    for (let j = 0; j < batchSize && i + j < totalUsers; j++) {
      const userId = i + j + 1;
      usersToCreate.push({
        first_name: `First${userId}`,
        last_name: `Last${userId}`,
        initials: `FL${userId}`,
        email: `user${userId}@example.com`,
        // Status is set to default "ACTIVE" as per schema
      });
    }

    // Use createMany for efficient batch insertion
    await prisma.users.createMany({
      data: usersToCreate,
      skipDuplicates: true, // Skip records that would cause unique constraint violations
    });

    console.log(
      `Created users ${i + 1} to ${Math.min(i + batchSize, totalUsers)}`
    );
  }

  console.log("Successfully populated users table with 1000 entries!");
}

main()
  .catch((e) => {
    console.error("Error populating users table:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
