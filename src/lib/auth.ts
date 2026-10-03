import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { sendEmail, emailLayout } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your Yoga Wellness password",
        html: emailLayout(
          "Reset your password",
          `Hi ${user.name}, click the button below to choose a new password. This link expires in 1 hour.`,
          "Reset password",
          url
        ),
      });
    },
    onPasswordReset: async ({ user }) => {
      await logActivity(user.id, "PASSWORD_RESET");
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email for Yoga Wellness",
        html: emailLayout(
          "Verify your email",
          `Welcome ${user.name}! Please confirm that this is your email address.`,
          "Verify email",
          url
        ),
      });
    },
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
  // lets server actions set/refresh the login cookie (must be the last plugin)
  plugins: [nextCookies()],
});
