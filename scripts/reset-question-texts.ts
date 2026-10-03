import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rows = await prisma.questionText.findMany();
  rows.forEach((r) => console.log(`  removing: ${r.key} = "${r.text}"`));
  const { count } = await prisma.questionText.deleteMany();
  console.log(`✅ Reset ${count} custom question texts back to the defaults`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
