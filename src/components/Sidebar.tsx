"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/prospects", label: "Prospects", icon: "◈" },
  { href: "/pipeline", label: "Pipeline", icon: "◎" },
];

export default function Sidebar({ userEmail, isAdmin }: { userEmail: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col" style={{ background: "#161927", borderRight: "1px solid #2d3757", zIndex: 40 }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid #2d3757" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold shrink-0" style={{ background: "#3399ff20", color: "#3399ff" }}>⬡</div>
        <div>
          <div className="font-bold text-sm" style={{ color: "#f2f4ff" }}>Algorido</div>
          <div className="text-xs" style={{ color: "#596494" }}>AI Prospect Tracker</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? "#3399ff20" : "transparent",
                color: active ? "#3399ff" : "#8d9ec7",
                borderLeft: active ? "2px solid #3399ff" : "2px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Admin link — only visible to admins */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <div className="text-xs font-semibold" style={{ color: "#596494" }}>ADMIN</div>
            </div>
            <Link href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: pathname === "/admin" ? "#ffa72620" : "transparent",
                color: pathname === "/admin" ? "#ffa726" : "#8d9ec7",
                borderLeft: pathname === "/admin" ? "2px solid #ffa726" : "2px solid transparent",
              }}
            >
              <span>◆</span>
              <span>All Users</span>
            </Link>
          </>
        )}
      </nav>

      {/* Bot status */}
      <div className="mx-3 mb-4 p-3 rounded-lg" style={{ background: "#1e2338", border: "1px solid #2d3757" }}>
        <div className="text-xs font-semibold mb-1" style={{ color: "#596494" }}>BOT STATUS</div>
        <div className="text-xs font-semibold mb-1" style={{ color: "#22d68d" }}>● ACTIVE</div>
        <div className="text-xs mb-1" style={{ color: "#8d9ec7" }}>Market Maker Vol. Bot</div>
        <a href="https://dash.algorido.com" target="_blank" rel="noreferrer" className="text-xs" style={{ color: "#3399ff" }}>dash.algorido.com ↗</a>
      </div>

      <div style={{ borderTop: "1px solid #2d3757" }} />

      {/* User */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#3399ff", color: "#0d0f1a" }}>
          {userEmail[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate" style={{ color: "#f2f4ff" }}>{userEmail}</div>
          <div className="text-xs" style={{ color: isAdmin ? "#ffa726" : "#596494" }}>{isAdmin ? "Admin" : "Member"}</div>
        </div>
        <button onClick={signOut} title="Sign out" className="text-xs shrink-0 hover:opacity-80" style={{ color: "#596494" }}>⏻</button>
      </div>
    </aside>
  );
}
