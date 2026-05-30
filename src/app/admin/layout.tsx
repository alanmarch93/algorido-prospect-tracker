import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { Profile } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let isAdmin = false;
  try {
    const { data: profile } = await supabase
      .from("profiles").select("is_admin").eq("id", user.id).single() as { data: Profile | null };
    isAdmin = profile?.is_admin ?? false;
  } catch {
    isAdmin = false;
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar userEmail={user.email ?? ""} isAdmin={isAdmin} />
      </div>
      <main className="flex-1 md:ml-[220px] min-h-screen pb-20 md:pb-0" style={{ background: "#0d0f1a" }}>
        <div className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-40"
          style={{ background: "#161927", borderBottom: "1px solid #2d3757" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
            style={{ background: "#3399ff20", color: "#3399ff" }}>⬡</div>
          <div>
            <div className="text-sm font-bold leading-none" style={{ color: "#f2f4ff" }}>Algorido AI</div>
            <div className="text-xs" style={{ color: "#596494" }}>Admin View</div>
          </div>
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
