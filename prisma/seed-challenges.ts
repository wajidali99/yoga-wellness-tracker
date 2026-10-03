import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const challenges = [
  {
    slug: "flexibility-7",
    title: "7-Day Flexibility Challenge",
    emoji: "🤸",
    description: "Loosen up your hips, hamstrings and back with a short routine every day.",
    tasks: [
      "Hold Downward Dog for 5 slow breaths, 3 times.",
      "Do 10 rounds of Cat-Cow to warm up your spine.",
      "Sit in Bound Angle for 1 minute, breathing deeply.",
      "Practice Triangle Pose on both sides, 5 breaths each.",
      "Rest in Child's Pose for 1 minute, then hold Cobra for 5 breaths.",
      "Hold Bridge Pose 3 times for 5 breaths each.",
      "Put it all together: a 15-minute flow, then 2 minutes of Savasana.",
    ],
  },
  {
    slug: "stress-relief-5",
    title: "5-Day Stress Relief",
    emoji: "😌",
    description: "Calm your mind with breathing, gentle poses and short meditations.",
    tasks: [
      "Complete a 1-minute Deep Breathing session.",
      "Rest in Child's Pose for 2 minutes, breathing slowly.",
      "Complete a 3-minute Mindful Meditation.",
      "Do 3 minutes of Deep Breathing with the calm tone.",
      "Gentle flow: Cat-Cow, Child's Pose, then 5 minutes of Savasana.",
    ],
  },
  {
    slug: "ai-pose-master",
    title: "AI Pose Master",
    emoji: "📷",
    description: "Use the AI Pose Checker to master all five AI-supported poses.",
    tasks: [
      "Hold Tree Pose correctly for at least 5 seconds in the Pose Checker.",
      "Hold Warrior II correctly for at least 5 seconds.",
      "Hold Goddess Pose correctly for at least 5 seconds.",
      "Hold Plank correctly for at least 10 seconds.",
      "Hold Downward Dog correctly for at least 10 seconds.",
    ],
  },
];

async function main() {
  for (const c of challenges) {
    const data = { ...c, durationDays: c.tasks.length };
    await prisma.challenge.upsert({ where: { slug: c.slug }, update: data, create: data });
  }
  console.log(`✅ Seeded ${challenges.length} challenges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
