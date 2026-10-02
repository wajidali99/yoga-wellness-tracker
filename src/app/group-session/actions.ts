"use server";

import { randomInt } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoomServiceClient } from "livekit-server-sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I to avoid confusion

function makeCode() {
  return Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return session.user;
}

export async function createGroupSession(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim().slice(0, 80) || `${user.name}'s yoga session`;

  let code = makeCode();
  while (await prisma.groupSession.findUnique({ where: { code } })) code = makeCode();

  await prisma.groupSession.create({ data: { code, title, hostId: user.id } });
  redirect(`/group-session/${code}`);
}

export async function joinGroupSession(formData: FormData) {
  await requireUser();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  redirect(`/group-session/${code}`);
}

export async function endGroupSession(code: string) {
  const user = await requireUser();
  const updated = await prisma.groupSession.updateMany({
    where: { code, hostId: user.id, isActive: true },
    data: { isActive: false },
  });
  if (updated.count === 0) return { ok: false };

  // disconnect everyone from the LiveKit room
  try {
    const host = process.env.LIVEKIT_URL!.replace(/^wss:/, "https:");
    const rooms = new RoomServiceClient(host, process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!);
    await rooms.deleteRoom(`yoga-${code}`);
  } catch {
    // room may already be empty – that's fine
  }
  return { ok: true };
}
