import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dir = path.join(process.cwd(), "public", "poses");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const poses = await prisma.yogaPose.findMany({ select: { slug: true, name: true } });

  for (const pose of poses) {
    const file = files.find((f) => /\.(jpe?g|png|webp)$/i.test(f) && f.replace(/\.[^.]+$/, "") === pose.slug);
    if (file) {
      await prisma.yogaPose.update({ where: { slug: pose.slug }, data: { imageUrl: `/poses/${file}` } });
      console.log(`✅ ${pose.name} -> /poses/${file}`);
    } else {
      console.log(`⚪ ${pose.name}: no image (expected ${pose.slug}.jpg)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
