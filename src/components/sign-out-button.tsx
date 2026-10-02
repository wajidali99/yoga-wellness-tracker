"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/sign-in");
        router.refresh();
      }}
      className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
    >
      Sign out
    </button>
  );
}
