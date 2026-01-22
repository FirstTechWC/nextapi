'use client'
import { useEffect, useLayoutEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GetAPIStatus, GetUserInfo } from "./api/os";
import { API_HEALTH, USER_DETAILS } from "@/types/os";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [server_status, set_server_status]      = useState<API_HEALTH>({status: "checking..." })
  const [user_info    , set_user_info]          = useState<USER_DETAILS>({id: "", username :"guest", email: "", auth_type: ""})

  useLayoutEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(()=>{
    if (status !== "authenticated" || !session?.accessToken) return;

    const fetchStatus = async () => {
      const result = await GetAPIStatus(session.accessToken)
      set_server_status({ status: result?.status ?? "unavailable" })
    }
    const fetchUserDetails = async () => {
      const userDetails = await GetUserInfo(session.accessToken)
      set_user_info(userDetails)
    }

    fetchStatus()
    fetchUserDetails()
  }, [status, session?.accessToken])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <h1>
              SEVER STATUS  : {server_status.status}
              <br />
              USER          : {user_info.username}
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-4 px-4 py-2 bg-gray-950 text-white rounded-md hover:bg-gray-900"
          >
            Sign Out
          </button>
      </main>
    </div>
  );
}
