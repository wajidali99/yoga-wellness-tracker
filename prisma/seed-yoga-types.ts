import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const yogaTypes = [
  {
    slug: "hatha",
    name: "Hatha Yoga",
    description: "A balanced, slower-paced style that teaches the basic poses with steady breathing. Ideal for building a strong foundation.",
    primaryBenefit: "Improves flexibility, balance and focus",
    frequency: "3–4 times a week",
    focusArea: "Full body & mind",
    durationMinutes: 30,
    poseSlugs: ["tree", "triangle", "cobra", "bound-angle", "childs-pose", "corpse"],
  },
  {
    slug: "vinyasa",
    name: "Vinyasa Flow",
    description: "A dynamic style where poses flow smoothly from one to the next, linked with the breath.",
    primaryBenefit: "Builds stamina, strength and flexibility together",
    frequency: "3–5 times a week",
    focusArea: "Full body",
    durationMinutes: 40,
    poseSlugs: ["downward-dog", "plank", "warrior-2", "triangle", "cobra", "childs-pose"],
  },
  {
    slug: "power",
    name: "Power Yoga",
    description: "A fitness-focused, energetic style with strong holds that build muscle and endurance.",
    primaryBenefit: "Builds strength and endurance",
    frequency: "3–4 times a week",
    focusArea: "Core, legs & arms",
    durationMinutes: 45,
    poseSlugs: ["plank", "goddess", "warrior-2", "downward-dog", "bridge"],
  },
  {
    slug: "yin",
    name: "Yin Yoga",
    description: "A slow style where poses are held for several minutes to gently stretch deep tissues and joints.",
    primaryBenefit: "Deep flexibility and healthier joints",
    frequency: "2–3 times a week",
    focusArea: "Hips, back & joints",
    durationMinutes: 30,
    poseSlugs: ["bound-angle", "childs-pose", "cat-cow", "bridge", "corpse"],
  },
  {
    slug: "restorative",
    name: "Restorative Yoga",
    description: "A very gentle, fully relaxing style using supported poses and slow breathing.",
    primaryBenefit: "Reduces stress and helps the body recover",
    frequency: "Daily or whenever you feel stressed",
    focusArea: "Mind & nervous system",
    durationMinutes: 20,
    poseSlugs: ["childs-pose", "bridge", "cat-cow", "corpse"],
  },
  {
    slug: "therapeutic",
    name: "Therapeutic Yoga (Back & Neck Care)",
    description: "Gentle, targeted movements that relieve tension in the spine, neck and shoulders and improve posture.",
    primaryBenefit: "Relieves back and neck pain and improves posture",
    frequency: "4–5 times a week, short sessions",
    focusArea: "Spine, neck & shoulders",
    durationMinutes: 15,
    poseSlugs: ["cat-cow", "cobra", "childs-pose", "bridge", "corpse"],
  },
];

async function main() {
  for (const t of yogaTypes) {
    await prisma.yogaType.upsert({ where: { slug: t.slug }, update: t, create: t });
  }
  console.log(`✅ Seeded ${yogaTypes.length} yoga types`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
