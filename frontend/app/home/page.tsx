'use client'
import { useEffect, useLayoutEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GetAPIStatus, GetUserInfo, ToggleUserRole } from "../api/os";
import { API_HEALTH, USER_DETAILS } from "@/types/os";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Routes, ProtectedRoutes, hasAccess } from "@/config/routes";


export default function Home() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [server_status, set_server_status]      = useState<API_HEALTH>({status: "checking..." })
  const [user_info    , set_user_info]          = useState<USER_DETAILS>({id: "", username :"guest", email: "", role: "", auth_type: ""})
  const userRole = session?.user?.role ?? 'guest'
  
 
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


    fetchStatus()
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
              FASTAPI SERVER HEALTH  : {server_status.status}
              <br />
              <hr/>
              USER          : {session?.user?.name}
              <hr/>
              <pre className="bg-accent rounded p-2 mt-2">{JSON.stringify(session?.user)}</pre>
          </h1>
          <div className="flex gap-4">
            <h1>
              RBAC TEST:
            </h1>
              <Button
                variant={'outline'} className="cursor-pointer text-primary font-semibold px-12 rounded-sm"
                disabled={!['admin'].includes(userRole)}
                onClick={()=>{
                  window.alert(`${userRole} has clicked this button`)
                }}
                
              >
                Admin Button
              </Button>
              <Button
                variant={'outline'} className="cursor-pointer text-primary font-semibold px-12 rounded-sm"
                disabled={!['guest','admin'].includes(userRole)}
                onClick={()=>{
                  window.alert(`${userRole} has clicked this button`)
                }}
              >
                Guest Button
              </Button>
          </div>
          <div className="flex flex-col gap-3">
            <h1>RBAC ROUTE TESTS</h1>

            
            {ProtectedRoutes.filter(route => route.path !== Routes.DASHBOARD).map((route) => {
              const canAccess = hasAccess(userRole, route.allowedRoles);
              return (
                <div key={route.path} className="flex items-center gap-2">
                  {canAccess ? (
                    <Link
                      className="text-blue-600 underline hover:text-blue-800"
                      href={route.path}
                    >
                      {route.label} {'>>>'}
                    </Link>
                  ) : (
                    <span className="text-zinc-400 line-through">
                      {route.label} (requires: {route.allowedRoles.join(', ')})
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${canAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {canAccess ? 'Access' : 'Denied'}
                  </span>
                </div>
              );
            })}
          </div>
          <Button
            onClick={async () => {
              const result = await ToggleUserRole(session?.accessToken);
              if (result) {
                await update({
                  role: result.user.role,
                  accessToken: result.access_token,
                });
                window.alert(result.message);
              } else {
                window.alert('Failed to toggle role');
              }
            }}
            variant={'outline'} className="cursor-pointer text-secondary font-semibold px-12 rounded-sm"
          >
            Toggle Role (Current: {userRole})
          </Button>
          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            variant={'outline'} className="cursor-pointer text-primary font-semibold px-12 rounded-sm"
          >
            Sign Out
          </Button>
      </main>
    </div>
  );
}
