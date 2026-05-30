"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/prospects", label: "Prospects", icon: "◈" },
  { href: "/pipeline", label: "Pipeline", icon: "◎" },
  { href: "/prospects/new", label: "Add", icon: "＋" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 flex"
      style={{ background: "#161927", borderTop: "1px solid #2d3757", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {nav.map(item => {
        const active = pathname === item.href || (item.href !== "/" && item.href !== "/prospects/new" && pathname.startsWith(item.href));
        const isAdd = item.href === "/prospects/new";
        return (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-all"
            style={{ color: isAdd ? "#0d0f1a" : active ? "#3399ff" : "#596494" }}
          >
            {isAdd ? (
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-0.5"
                style={{ background: "#3399ff", color: "#0d0f1a" }}>＋</span>
            ) : (
              <>
                <span className="text-xl mb-0.5" style={{ color: active ? "#3399ff" : "#596494" }}>{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
