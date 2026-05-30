import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { Profile } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single() as { data: Profile | null };

  const isAdmin = profile?.is_admin ?? false;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar userEmail={user.email ?? ""} isAdmin={isAdmin} />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-[220px] min-h-screen pb-20 md:pb-0" style={{ background: "#0d0f1a" }}>
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-40"
          style={{ background: "#161927", borderBottom: "1px solid #2d3757" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
            style={{ background: "#3399ff20", color: "#3399ff" }}>⬡</div>
          <div>
            <div className="text-sm font-bold leading-none" style={{ color: "#f2f4ff" }}>Algorido AI</div>
            <div className="text-xs" style={{ color: "#596494" }}>Prospect Tracker</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <a href="/admin" className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "#ffa72620", color: "#ffa726" }}>Admin</a>
            )}
            <div className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "#22d68d20", color: "#22d68d" }}>● Live</div>
          </div>
        </div>

        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
