import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "missing";
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceKeyPreview = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? "not set";

  return (
    <div className="p-8">
      <div className="rounded-xl p-6 space-y-3" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <div className="font-semibold" style={{ color: "#f2f4ff" }}>Admin Debug Info</div>
        <div className="text-sm" style={{ color: "#8d9ec7" }}>User: {user.email}</div>
        <div className="text-sm" style={{ color: "#8d9ec7" }}>Supabase URL: {url.slice(0, 40)}</div>
        <div className="text-sm" style={{ color: hasServiceKey ? "#22d68d" : "#ff5959" }}>
          Service Role Key: {hasServiceKey ? `✓ set (${serviceKeyPreview}...)` : "✗ missing"}
        </div>
      </div>
    </div>
  );
}
