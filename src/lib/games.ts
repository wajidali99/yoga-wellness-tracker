export const GAMES = [
  {
    slug: "memory",
    title: "Memory Match",
    emoji: "🃏",
    desc: "Flip the cards and find all the matching yoga pairs.",
    how: "Click two cards to flip them. Find all 6 pairs with as few moves and as little time as possible.",
    gradient: "from-brand-400 to-brand-700",
  },
  {
    slug: "focus",
    title: "Focus Dot",
    emoji: "🎯",
    desc: "Tap the moving dot as many times as you can in 30 seconds.",
    how: "Click the green dot as fast as you can. Clicking outside the dot costs points. You have 30 seconds.",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    slug: "stroop",
    title: "Color Calm",
    emoji: "🎨",
    desc: "Pick the ink color, not the word. A classic focus test.",
    how: "A color word appears in a different ink color. Click the button for the INK color, not the word. You have 30 seconds.",
    gradient: "from-purple-400 to-fuchsia-600",
  },
];

export const GAME_SLUGS = GAMES.map((g) => g.slug);
