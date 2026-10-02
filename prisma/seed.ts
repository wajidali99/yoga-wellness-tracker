import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Difficulty } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const poses = [
  {
    slug: "downward-dog",
    name: "Downward Dog",
    sanskritName: "Adho Mukha Svanasana",
    description: "An inverted V-shape pose that stretches the whole back of the body and builds upper-body strength.",
    benefits: ["Stretches hamstrings and calves", "Strengthens arms and shoulders", "Relieves back tension", "Calms the mind"],
    instructions: [
      "Start on hands and knees, wrists under shoulders and knees under hips.",
      "Tuck your toes and lift your hips up and back.",
      "Straighten your legs as much as you can, heels reaching toward the floor.",
      "Press firmly through your palms and relax your neck.",
      "Hold for 5 to 8 breaths.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Full body",
  },
  {
    slug: "tree",
    name: "Tree Pose",
    sanskritName: "Vrikshasana",
    description: "A standing balance pose that improves focus, stability and posture.",
    benefits: ["Improves balance", "Strengthens legs and ankles", "Improves concentration", "Opens the hips"],
    instructions: [
      "Stand tall with feet together.",
      "Shift your weight onto your left foot.",
      "Place your right foot on your inner left calf or thigh (never on the knee).",
      "Bring your palms together at your chest or raise them overhead.",
      "Hold for 5 breaths, then switch sides.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Legs",
  },
  {
    slug: "warrior-2",
    name: "Warrior II",
    sanskritName: "Virabhadrasana II",
    description: "A strong standing pose that builds stamina in the legs and opens the hips and chest.",
    benefits: ["Strengthens legs", "Opens hips and chest", "Builds stamina", "Improves focus"],
    instructions: [
      "Step your feet wide apart.",
      "Turn your right foot out 90 degrees and your left foot in slightly.",
      "Bend your right knee directly over your right ankle.",
      "Stretch your arms out parallel to the floor.",
      "Look over your right hand and hold for 5 breaths, then switch sides.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Legs",
  },
  {
    slug: "goddess",
    name: "Goddess Pose",
    sanskritName: "Utkata Konasana",
    description: "A wide squat that strengthens the lower body and opens the hips.",
    benefits: ["Strengthens thighs and glutes", "Opens hips", "Builds heat in the body", "Strengthens the core"],
    instructions: [
      "Stand with feet wide apart, toes turned out.",
      "Bend your knees and lower your hips, knees tracking over toes.",
      "Keep your back straight and chest lifted.",
      "Bend your elbows to 90 degrees with palms facing forward.",
      "Hold for 5 breaths.",
    ],
    difficulty: Difficulty.INTERMEDIATE,
    focusArea: "Hips",
  },
  {
    slug: "plank",
    name: "Plank Pose",
    sanskritName: "Phalakasana",
    description: "A core-strengthening pose that builds strength in the arms, shoulders and abdomen.",
    benefits: ["Strengthens the core", "Strengthens arms and wrists", "Improves posture", "Builds endurance"],
    instructions: [
      "Start on hands and knees.",
      "Step your feet back so your body forms a straight line.",
      "Keep wrists under shoulders and engage your stomach.",
      "Do not let your hips drop or lift too high.",
      "Hold for 20 to 30 seconds.",
    ],
    difficulty: Difficulty.INTERMEDIATE,
    focusArea: "Core",
  },
  {
    slug: "childs-pose",
    name: "Child's Pose",
    sanskritName: "Balasana",
    description: "A gentle resting pose that relaxes the back and calms the mind.",
    benefits: ["Relieves back and neck tension", "Calms the mind", "Gently stretches hips and thighs", "Helps relaxation"],
    instructions: [
      "Kneel on the floor with big toes touching.",
      "Sit back on your heels and spread your knees.",
      "Fold forward and rest your forehead on the floor.",
      "Stretch your arms forward or rest them by your sides.",
      "Breathe slowly for 1 minute.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Back",
  },
  {
    slug: "bound-angle",
    name: "Bound Angle",
    sanskritName: "Baddha Konasana",
    description: "A seated hip opener that improves flexibility in the hips and inner thighs.",
    benefits: ["Opens hips", "Stretches inner thighs", "Improves flexibility", "Calms the mind"],
    instructions: [
      "Sit with your legs straight in front of you.",
      "Bend your knees and bring the soles of your feet together.",
      "Hold your feet with your hands.",
      "Sit tall and let your knees relax toward the floor.",
      "Hold for 1 minute.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Hips",
  },
  {
    slug: "cobra",
    name: "Cobra Pose",
    sanskritName: "Bhujangasana",
    description: "A gentle backbend that strengthens the spine and opens the chest.",
    benefits: ["Strengthens the spine", "Relieves lower back stiffness", "Opens chest and shoulders", "Improves posture"],
    instructions: [
      "Lie on your stomach with legs straight.",
      "Place your hands under your shoulders.",
      "Press into your hands and slowly lift your chest.",
      "Keep elbows slightly bent and shoulders away from ears.",
      "Hold for 3 to 5 breaths, then lower down.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Back",
  },
  {
    slug: "cat-cow",
    name: "Cat-Cow",
    sanskritName: "Marjaryasana-Bitilasana",
    description: "A flowing movement that warms up the spine and relieves back and neck tension.",
    benefits: ["Improves spine flexibility", "Relieves back pain", "Relieves neck tension", "Coordinates breath and movement"],
    instructions: [
      "Start on hands and knees.",
      "Inhale: drop your belly, lift your chest and look up (Cow).",
      "Exhale: round your back and tuck your chin (Cat).",
      "Move slowly with your breath.",
      "Repeat 8 to 10 times.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Back",
  },
  {
    slug: "bridge",
    name: "Bridge Pose",
    sanskritName: "Setu Bandhasana",
    description: "A backbend that strengthens the back, glutes and legs while opening the chest.",
    benefits: ["Strengthens back and glutes", "Opens chest", "Relieves lower back pain", "Reduces stress"],
    instructions: [
      "Lie on your back with knees bent and feet hip-width apart.",
      "Keep your arms by your sides, palms down.",
      "Press into your feet and lift your hips.",
      "Keep your knees in line with your hips.",
      "Hold for 5 breaths, then lower slowly.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Back",
  },
  {
    slug: "triangle",
    name: "Triangle Pose",
    sanskritName: "Trikonasana",
    description: "A standing pose that stretches the sides of the body, legs and hips.",
    benefits: ["Stretches legs and hips", "Stretches the side body", "Improves balance", "Relieves neck and back stiffness"],
    instructions: [
      "Stand with feet wide apart.",
      "Turn your right foot out 90 degrees.",
      "Stretch your arms out and reach forward over your right leg.",
      "Lower your right hand to your shin or the floor, left arm up.",
      "Hold for 5 breaths, then switch sides.",
    ],
    difficulty: Difficulty.INTERMEDIATE,
    focusArea: "Legs",
  },
  {
    slug: "corpse",
    name: "Corpse Pose",
    sanskritName: "Savasana",
    description: "A complete relaxation pose usually done at the end of practice.",
    benefits: ["Deep relaxation", "Reduces stress", "Lowers fatigue", "Calms the nervous system"],
    instructions: [
      "Lie flat on your back.",
      "Let your feet fall open and arms rest by your sides, palms up.",
      "Close your eyes.",
      "Relax every part of your body.",
      "Breathe naturally for 3 to 5 minutes.",
    ],
    difficulty: Difficulty.BEGINNER,
    focusArea: "Mind",
  },
];

async function main() {
  for (const pose of poses) {
    await prisma.yogaPose.upsert({
      where: { slug: pose.slug },
      update: pose,
      create: pose,
    });
  }
  console.log(`✅ Seeded ${poses.length} yoga poses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
