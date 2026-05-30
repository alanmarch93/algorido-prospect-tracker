import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { Prospect, Profile } from "@/lib/types";
import StageBadge from "@/components/StageBadge";
import Link from "next/link";

export default async function AdminPage() {
  try {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single() as { data: Profile | null };

  if (!profile?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-lg font-semibold" style={{ color: "#f2f4ff" }}>Access Denied</div>
          <div className="text-sm mt-2" style={{ color: "#8d9ec7" }}>You do not have admin privileges.</div>
          <Link href="/" className="inline-block mt-4 text-sm" style={{ color: "#3399ff" }}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Service role key required to bypass RLS
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="rounded-xl p-8 max-w-md w-full text-center" style={{ background: "#161927", border: "1px solid #ffa72640" }}>
          <div className="text-3xl mb-4">⚙️</div>
          <div className="text-lg font-semibold mb-2" style={{ color: "#f2f4ff" }}>Setup Required</div>
          <div className="text-sm mb-4" style={{ color: "#8d9ec7" }}>
            Add <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#1e2338", color: "#ffa726" }}>SUPABASE_SERVICE_ROLE_KEY</code> to your Vercel environment variables to enable the admin view.
          </div>
          <div className="text-xs text-left rounded-lg p-4 space-y-2" style={{ background: "#1e2338", color: "#8d9ec7" }}>
            <div>1. Go to <span style={{ color: "#3399ff" }}>supabase.com</span> → Settings → API</div>
            <div>2. Copy the <span style={{ color: "#ffa726" }}>service_role</span> secret key</div>
            <div>3. Go to <span style={{ color: "#3399ff" }}>vercel.com</span> → your project → Settings → Environment Variables</div>
            <div>4. Add <span style={{ color: "#ffa726" }}>SUPABASE_SERVICE_ROLE_KEY</span> and paste the key</div>
            <div>5. Redeploy the project</div>
          </div>
        </div>
      </div>
    );
  }

  // Use service role to bypass RLS and fetch ALL data
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: allProspects = [] } = await service
    .from("prospects").select("*").order("created_at", { ascending: false }) as { data: Prospect[] };

  const { data: profiles = [] } = await service
    .from("profiles").select("*") as { data: Profile[] };

  // Group prospects by user
  const byUser = profiles.map(p => ({
    profile: p,
    prospects: allProspects.filter(pr => pr.user_id === p.id),
  })).filter(g => g.prospects.length > 0);

  // Global totals
  const totalProspects = allProspects.length;
  const totalConverted = allProspects.filter(p => p.stage === "Converted").length;
  const totalInvested = allProspects
    .filter(p => p.stage === "Converted" && p.amount_invested != null)
    .reduce((sum, p) => sum + Number(p.amount_invested), 0);
  const totalUsers = byUser.length;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#ffa72620", color: "#ffa726" }}>ADMIN</span>
          <span className="text-xs" style={{ color: "#596494" }}>All Users View</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: "#f2f4ff" }}>Admin Dashboard</h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: "#8d9ec7" }}>Monitor all prospect activity across your entire team</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users",     value: String(totalUsers),    sub: "active trackers",  color: "#3399ff" },
          { label: "All Prospects",   value: String(totalProspects),sub: "across all users", color: "#9966ff" },
          { label: "Total Converted", value: String(totalConverted),sub: `${totalProspects ? Math.round(totalConverted/totalProspects*100) : 0}% rate`, color: "#22d68d" },
          { label: "Total Invested",  value: totalInvested > 0 ? `$${totalInvested.toLocaleString()}` : "$0", sub: "in AI bots", color: "#ffa726" },
        ].map((k, i) => (
          <div key={i} className="rounded-xl p-4 relative overflow-hidden" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <div className="text-xs font-medium mb-2" style={{ color: "#8d9ec7" }}>{k.label}</div>
            <div className="text-2xl md:text-3xl font-extrabold mb-1" style={{ color: "#f2f4ff" }}>{k.value}</div>
            <div className="text-xs" style={{ color: "#8d9ec7" }}>{k.sub}</div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
          </div>
        ))}
      </div>

      {/* Per-user breakdown */}
      <div className="space-y-4">
        {byUser.length === 0 && (
          <div className="text-center py-12 rounded-xl text-sm" style={{ background: "#161927", border: "1px solid #2d3757", color: "#596494" }}>
            No prospects from any user yet.
          </div>
        )}
        {byUser.map(({ profile: p, prospects }) => {
          const converted = prospects.filter(pr => pr.stage === "Converted").length;
          const invested = prospects
            .filter(pr => pr.stage === "Converted" && pr.amount_invested != null)
            .reduce((sum, pr) => sum + Number(pr.amount_invested), 0);
          const convRate = prospects.length ? Math.round(converted / prospects.length * 100) : 0;

          return (
            <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: "#161927", border: "1px solid #2d3757" }}>
              {/* User header */}
              <div className="px-5 py-4 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid #2d3757", background: "#1e2338" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "#3399ff20", color: "#3399ff" }}>
                  {p.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "#f2f4ff" }}>{p.email}</div>
                  <div className="text-xs" style={{ color: "#596494" }}>{prospects.length} prospect{prospects.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-bold" style={{ color: "#22d68d" }}>{converted}</div>
                    <div style={{ color: "#596494" }}>Converted</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold" style={{ color: "#3399ff" }}>{convRate}%</div>
                    <div style={{ color: "#596494" }}>Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold" style={{ color: "#ffa726" }}>
                      {invested > 0 ? `$${invested.toLocaleString()}` : "—"}
                    </div>
                    <div style={{ color: "#596494" }}>Invested</div>
                  </div>
                </div>
              </div>

              {/* Prospect rows */}
              <div className="divide-y" style={{ borderColor: "#2d3757" }}>
                {prospects.slice(0, 5).map(pr => (
                  <div key={pr.id} className="flex items-center gap-3 px-5 py-3 flex-wrap">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "#1e2338", color: "#3399ff" }}>{pr.full_name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "#f2f4ff" }}>{pr.full_name}</div>
                      <div className="text-xs truncate" style={{ color: "#596494" }}>{pr.company_name}</div>
                    </div>
                    <StageBadge stage={pr.stage} />
                    {pr.stage === "Converted" && pr.amount_invested != null && (
                      <span className="text-xs font-bold" style={{ color: "#22d68d" }}>
                        ${Number(pr.amount_invested).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
                {prospects.length > 5 && (
                  <div className="px-5 py-2 text-xs" style={{ color: "#596494" }}>
                    +{prospects.length - 5} more prospects
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return (
      <div className="p-8">
        <div className="rounded-xl p-6" style={{ background: "#ff595915", border: "1px solid #ff595940" }}>
          <div className="font-semibold mb-2" style={{ color: "#ff5959" }}>Server Error (debug)</div>
          <pre className="text-xs whitespace-pre-wrap" style={{ color: "#8d9ec7" }}>{msg}</pre>
        </div>
      </div>
    );
  }
}
