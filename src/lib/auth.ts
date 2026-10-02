import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false, // users cannot set their own role
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await logActivity(user.id, "SIGN_UP", user.email);
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await logActivity(session.userId, "LOGIN");
        },
      },
    },
  },
});
