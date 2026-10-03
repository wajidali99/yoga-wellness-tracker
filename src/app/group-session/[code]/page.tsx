import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GroupRoom from "@/components/group-room";

export const dynamic = "force-dynamic";

function Message({ text }: { text: string }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sand-50 flex items-center justify-center p-6">
      <div className="rounded-xl bg-white p-8 text-center shadow-lg">
        <p className="text-gray-700">{text}</p>
        <Link href="/group-session" className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">
          Back to sessions
        </Link>
      </div>
    </main>
  );
}

export default async function GroupRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { code } = await params;
  const groupSession = await prisma.groupSession.findUnique({ where: { code: code.toUpperCase() } });

  if (!groupSession) return <Message text="No session found with this code. Please check the code and try again." />;
  if (!groupSession.isActive) return <Message text="This session has ended." />;

  const isHost = groupSession.hostId === session.user.id;

  // short-lived token that lets this user join only this room
  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: session.user.id,
    name: session.user.name,
    ttl: "2h",
  });
  at.addGrant({
    roomJoin: true,
    room: `yoga-${groupSession.code}`,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost,
  });
  const token = await at.toJwt();

  return (
    <GroupRoom
      serverUrl={process.env.LIVEKIT_URL!}
      token={token}
      code={groupSession.code}
      title={groupSession.title}
      isHost={isHost}
    />
  );
}
