"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { endGroupSession } from "@/app/group-session/actions";

type Props = { serverUrl: string; token: string; code: string; title: string; isHost: boolean };

export default function GroupRoom({ serverUrl, token, code, title, isHost }: Props) {
  const router = useRouter();
  const [disconnected, setDisconnected] = useState(false);

  async function endForAll() {
    if (!confirm("End this session for everyone?")) return;
    await endGroupSession(code);
    router.push("/group-session");
  }

  return (
    <div className="relative flex h-screen flex-col bg-gray-950">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white">
        <div>
          <h1 className="font-semibold">{title}</h1>
          <p className="text-sm text-gray-400">
            Session code: <span className="font-mono text-white">{code}</span> – share it so others can join
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/group-session" className="rounded-md bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600">
            Leave
          </Link>
          {isHost && (
            <button onClick={endForAll} className="rounded-md bg-red-500 px-4 py-2 text-sm hover:bg-red-600">
              End session for all
            </button>
          )}
        </div>
      </header>

      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        video
        audio
        data-lk-theme="default"
        style={{ flex: 1, minHeight: 0 }}
        onConnected={() => setDisconnected(false)}
        onDisconnected={() => setDisconnected(true)}
      >
        <VideoConference />
      </LiveKitRoom>

      {/* shown only when the user has really left (or the host ended the session) */}
      {disconnected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="rounded-xl bg-white p-8 text-center shadow-lg">
            <p className="text-gray-800">You have left the session.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Rejoin
              </button>
              <Link href="/group-session" className="rounded-md bg-sky-500 px-4 py-2 text-white hover:bg-sky-600">
                Back to sessions
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
