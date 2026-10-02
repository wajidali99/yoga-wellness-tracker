import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npx tsx scripts/make-admin.ts you@example.com");
  const user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`✅ ${user.name} (${user.email}) is now an ADMIN`);
}

main()
  .catch((e) => {
    console.error("❌", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
