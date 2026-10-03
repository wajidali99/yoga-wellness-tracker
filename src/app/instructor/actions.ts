"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/roles";
import { logActivity } from "@/lib/activity";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

export async function scheduleClass(formData: FormData) {
  const me = await requireInstructor();
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const description = String(formData.get("description") ?? "").trim().slice(0, 500);
  const when = String(formData.get("startsAt") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes") ?? 30);
  const startsAt = new Date(`${when}:00+05:00`); // the form time is Pakistan time

  if (!title || isNaN(startsAt.getTime()) || durationMinutes < 10 || durationMinutes > 180) return;

  await prisma.yogaClass.create({ data: { title, description, startsAt, durationMinutes, instructorId: me.id } });
  await logActivity(me.id, "CLASS_SCHEDULED", title);
  revalidatePath("/instructor");
  revalidatePath("/classes");
}

export async function cancelClass(classId: string) {
  const me = await requireInstructor();
  await prisma.yogaClass.deleteMany({ where: { id: classId, instructorId: me.id } });
  await logActivity(me.id, "CLASS_CANCELLED", classId);
  revalidatePath("/instructor");
  revalidatePath("/classes");
}

// starts (or re-opens) the live video room for a class
export async function startClass(classId: string) {
  const me = await requireInstructor();
  const yogaClass = await prisma.yogaClass.findFirst({ where: { id: classId, instructorId: me.id } });
  if (!yogaClass) return;

  let code = yogaClass.sessionCode ?? "";
  const existing = code ? await prisma.groupSession.findUnique({ where: { code } }) : null;

  if (!existing || !existing.isActive) {
    code = makeCode();
    while (await prisma.groupSession.findUnique({ where: { code } })) code = makeCode();
    await prisma.groupSession.create({ data: { code, title: yogaClass.title, hostId: me.id } });
    await prisma.yogaClass.update({ where: { id: classId }, data: { sessionCode: code } });
    await logActivity(me.id, "CLASS_STARTED", yogaClass.title);
  }
  redirect(`/group-session/${code}`);
}

export async function sendFeedback(formData: FormData) {
  const me = await requireInstructor();
  const studentId = String(formData.get("studentId") ?? "");
  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);
  if (message.length < 3) return;

  // instructors can only message students enrolled in their own classes
  if (me.role !== "ADMIN") {
    const linked = await prisma.classEnrollment.findFirst({ where: { userId: studentId, yogaClass: { instructorId: me.id } } });
    if (!linked) return;
  }

  await prisma.instructorFeedback.create({ data: { instructorId: me.id, studentId, message } });
  await logActivity(me.id, "FEEDBACK_SENT", studentId);
  revalidatePath(`/instructor/students/${studentId}`);
}
