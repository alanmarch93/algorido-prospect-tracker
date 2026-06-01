"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Prospect {
  id: string; full_name: string; email: string | null; phone: string | null;
  company_name: string; website: string | null; stage: string;
  lead_source: string; score: number; amount_invested: number | null;
  notes: string | null; converted_at: string | null; created_at: string;
  user_id: string;
}
interface Profile { id: string; email: string; is_admin: boolean; }

function exportAllCSV(prospects: Prospect[], profiles: Profile[]) {
  if (prospects.length === 0) { alert("No prospects to export."); return; }
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p.email]));
  const headers = [
    "Member Email", "Full Name", "Email", "Phone", "Company", "Website",
    "Stage", "Lead Source", "Score", "Amount Invested (USD)",
    "Notes", "Converted On", "Added On",
  ];
  const rows = prospects.map(p => [
    profileMap[p.user_id] ?? "Unknown",
    p.full_name ?? "",
    p.email ?? "",
    p.phone ?? "",
    p.company_name ?? "",
    p.website ?? "",
    p.stage ?? "",
    p.lead_source ?? "",
    p.score ?? "",
    p.amount_invested ?? "",
    (p.notes ?? "").replace(/\n/g, " "),
    p.converted_at ? new Date(p.converted_at).toLocaleDateString() : "",
    p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `algorido-all-prospects-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportUserCSV(prospects: Prospect[], userEmail: string) {
  if (prospects.length === 0) { alert("No prospects to export."); return; }
  const headers = [
    "Full Name", "Email", "Phone", "Company", "Website",
    "Stage", "Lead Source", "Score", "Amount Invested (USD)",
    "Notes", "Converted On", "Added On",
  ];
  const rows = prospects.map(p => [
    p.full_name ?? "", p.email ?? "", p.phone ?? "", p.company_name ?? "",
    p.website ?? "", p.stage ?? "", p.lead_source ?? "", p.score ?? "",
    p.amount_invested ?? "", (p.notes ?? "").replace(/\n/g, " "),
    p.converted_at ? new Date(p.converted_at).toLocaleDateString() : "",
    p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `algorido-${userEmail.split("@")[0]}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const stageColor: Record<string, string> = {
  Outreach: "#9966ff", Contacted: "#3399ff", Interested: "#ffa726",
  "Demo Set": "#ffa726", Converted: "#22d68d", Lost: "#ff5959",
};

export default function AdminPage() {
  const [data, setData] = useState<{ prospects: Prospect[]; profiles: Profile[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0d0f1a" }}>
      <div className="text-sm" style={{ color: "#8d9ec7" }}>Loading admin data…</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen p-8" style={{ background: "#0d0f1a" }}>
      <div className="rounded-xl p-6 max-w-lg w-full" style={{ background: "#ff595915", border: "1px solid #ff595940" }}>
        <div className="font-semibold mb-2" style={{ color: "#ff5959" }}>Error</div>
        <div className="text-sm mb-4" style={{ color: "#8d9ec7" }}>{error}</div>
        {error.includes("SERVICE_ROLE_KEY") && (
          <div className="text-xs space-y-1 p-3 rounded-lg" style={{ background: "#1e2338", color: "#8d9ec7" }}>
            <div>1. Supabase → Settings → API → copy <b style={{ color: "#ffa726" }}>service_role</b> key</div>
            <div>2. Vercel → project → Settings → Environment Variables</div>
            <div>3. Add <b style={{ color: "#ffa726" }}>SUPABASE_SERVICE_ROLE_KEY</b> → Redeploy</div>
          </div>
        )}
        <Link href="/" className="inline-block mt-4 text-sm" style={{ color: "#3399ff" }}>← Back to Dashboard</Link>
      </div>
    </div>
  );

  if (!data) return null;

  const { prospects, profiles } = data;
  const byUser = profiles.map(p => ({
    profile: p,
    prospects: prospects.filter(pr => pr.user_id === p.id),
  })).filter(g => g.prospects.length > 0);

  const totalConverted = prospects.filter(p => p.stage === "Converted").length;
  const totalInvested = prospects
    .filter(p => p.stage === "Converted" && p.amount_invested != null)
    .reduce((sum, p) => sum + Number(p.amount_invested), 0);

  return (
    <div style={{ background: "#0d0f1a", minHeight: "100vh" }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 sticky top-0 z-10" style={{ background: "#161927", borderBottom: "1px solid #2d3757" }}>
        <Link href="/" className="text-sm" style={{ color: "#3399ff" }}>← Dashboard</Link>
        <div className="flex-1" />
        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "#ffa72620", color: "#ffa726" }}>ADMIN</span>
      </div>

      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#f2f4ff" }}>Admin Dashboard</h1>
            <p className="text-sm" style={{ color: "#8d9ec7" }}>All prospect activity across your team</p>
          </div>
          <button
            onClick={() => exportAllCSV(prospects, profiles)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "#22d68d20", color: "#22d68d", border: "1px solid #22d68d40" }}
          >
            ⬇ Export All CSV
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Users",     value: String(byUser.length),   color: "#3399ff" },
            { label: "All Prospects",   value: String(prospects.length), color: "#9966ff" },
            { label: "Total Converted", value: String(totalConverted),   color: "#22d68d" },
            { label: "Total Invested",  value: totalInvested > 0 ? `$${totalInvested.toLocaleString()}` : "$0", color: "#ffa726" },
          ].map((k, i) => (
            <div key={i} className="rounded-xl p-4 relative overflow-hidden" style={{ background: "#161927", border: "1px solid #2d3757" }}>
              <div className="text-xs mb-2" style={{ color: "#8d9ec7" }}>{k.label}</div>
              <div className="text-2xl font-extrabold" style={{ color: "#f2f4ff" }}>{k.value}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
            </div>
          ))}
        </div>

        {/* Per-user */}
        <div className="space-y-4">
          {byUser.length === 0 && (
            <div className="text-center py-12 rounded-xl text-sm" style={{ background: "#161927", border: "1px solid #2d3757", color: "#596494" }}>
              No prospects yet.
            </div>
          )}
          {byUser.map(({ profile: p, prospects: ps }) => {
            const converted = ps.filter(pr => pr.stage === "Converted").length;
            const invested = ps.filter(pr => pr.stage === "Converted" && pr.amount_invested != null)
              .reduce((sum, pr) => sum + Number(pr.amount_invested), 0);
            return (
              <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: "#161927", border: "1px solid #2d3757" }}>
                <div className="px-5 py-4 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid #2d3757", background: "#1e2338" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: "#3399ff20", color: "#3399ff" }}>
                    {p.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: "#f2f4ff" }}>{p.email}</div>
                    <div className="text-xs" style={{ color: "#596494" }}>{ps.length} prospect{ps.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-bold" style={{ color: "#22d68d" }}>{converted}</div>
                      <div style={{ color: "#596494" }}>Converted</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold" style={{ color: "#ffa726" }}>{invested > 0 ? `$${invested.toLocaleString()}` : "—"}</div>
                      <div style={{ color: "#596494" }}>Invested</div>
                    </div>
                    <button
                      onClick={() => exportUserCSV(ps, p.email)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-80"
                      style={{ background: "#22d68d20", color: "#22d68d", border: "1px solid #22d68d40" }}
                    >
                      ⬇ CSV
                    </button>
                  </div>
                </div>
                <div>
                  {ps.slice(0, 5).map((pr, i) => (
                    <div key={pr.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: i < ps.slice(0,5).length-1 ? "1px solid #2d3757" : undefined }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#1e2338", color: "#3399ff" }}>
                        {pr.full_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: "#f2f4ff" }}>{pr.full_name}</div>
                        <div className="text-xs truncate" style={{ color: "#596494" }}>{pr.company_name}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${stageColor[pr.stage] ?? "#3399ff"}20`, color: stageColor[pr.stage] ?? "#3399ff" }}>
                        {pr.stage}
                      </span>
                      {pr.stage === "Converted" && pr.amount_invested != null && (
                        <span className="text-xs font-bold" style={{ color: "#22d68d" }}>${Number(pr.amount_invested).toLocaleString()}</span>
                      )}
                    </div>
                  ))}
                  {ps.length > 5 && (
                    <div className="px-5 py-2 text-xs" style={{ color: "#596494" }}>+{ps.length - 5} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
