import { createClient } from "@/lib/supabase/server";
import { Prospect } from "@/lib/types";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: prospects = [] } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false }) as { data: Prospect[] };

  const total = prospects.length;
  const qualified = prospects.filter(p => ["Interested","Demo Set","Converted"].includes(p.stage)).length;
  const active = prospects.filter(p => p.stage === "Converted").length;
  const pipeline = total * 100;
  const totalInvested = prospects
    .filter(p => p.stage === "Converted" && p.amount_invested != null)
    .reduce((sum, p) => sum + Number(p.amount_invested), 0);

  const STAGES = ["Outreach","Contacted","Interested","Demo Set","Converted"];
  const stageCounts = STAGES.map(s => ({ stage: s, count: prospects.filter(p => p.stage === s).length }));
  const topProspects = [...prospects].sort((a, b) => b.score - a.score).slice(0, 6);

  const kpis = [
    { label: "Total Prospects", value: String(total), sub: "tracked leads", color: "#3399ff" },
    { label: "Qualified", value: String(qualified), sub: `${total ? Math.round(qualified/total*100) : 0}% qualify`, color: "#22d68d" },
    { label: "Converted", value: String(active), sub: "active accounts", color: "#9966ff" },
    { label: "Total Invested", value: totalInvested > 0 ? `$${totalInvested.toLocaleString()}` : "$0", sub: "in AI bots", color: "#22d68d" },
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: "#f2f4ff" }}>Dashboard</h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: "#8d9ec7" }}>Algorido AI prospect pipeline overview</p>
      </div>

      {/* KPI Cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-xl p-4 relative overflow-hidden" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <div className="text-xs font-medium mb-2" style={{ color: "#8d9ec7" }}>{k.label}</div>
            <div className="text-2xl md:text-3xl font-extrabold mb-1" style={{ color: "#f2f4ff" }}>{k.value}</div>
            <div className="text-xs" style={{ color: "#8d9ec7" }}>{k.sub}</div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
          </div>
        ))}
      </div>

      {/* Pipeline Funnel */}
      <div className="rounded-xl p-4 md:p-5 mb-4" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <h2 className="font-semibold mb-1" style={{ color: "#f2f4ff" }}>Pipeline Funnel</h2>
        <p className="text-xs mb-4" style={{ color: "#8d9ec7" }}>Prospects by stage</p>
        <div className="space-y-3">
          {stageCounts.map((s, i) => {
            const pct = total ? Math.round(s.count / total * 100) : 0;
            const colors = ["#3399ff","#9966ff","#ffa726","#ffa726","#22d68d"];
            return (
              <div key={s.stage} className="flex items-center gap-3">
                <div className="w-20 md:w-24 text-xs shrink-0" style={{ color: "#8d9ec7" }}>{s.stage}</div>
                <div className="w-6 text-xs font-semibold shrink-0 text-right" style={{ color: "#f2f4ff" }}>{s.count}</div>
                <div className="flex-1 h-2 rounded-full" style={{ background: "#2d3757" }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: colors[i] }} />
                </div>
                <div className="w-7 text-xs shrink-0 text-right" style={{ color: "#596494" }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion stat */}
      <div className="rounded-xl p-4 md:p-5 mb-4" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <h2 className="font-semibold mb-3" style={{ color: "#f2f4ff" }}>Conversion Rate</h2>
        <div className="flex items-end gap-4">
          <div className="text-5xl font-extrabold" style={{ color: "#3399ff" }}>
            {total ? Math.round(active / total * 100) : 0}%
          </div>
          <div className="mb-1 text-sm" style={{ color: "#8d9ec7" }}>{active} converted / {total} total</div>
        </div>
        <div className="h-px my-4" style={{ background: "#2d3757" }} />
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Qualified", val: String(qualified), color: "#22d68d" },
            { label: "In Progress", val: String(prospects.filter(p => ["Contacted","Interested","Demo Set"].includes(p.stage)).length), color: "#3399ff" },
            { label: "Lost", val: String(prospects.filter(p => p.stage === "Lost").length), color: "#ff5959" },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.val}</div>
              <div className="text-xs mt-0.5" style={{ color: "#596494" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Prospects */}
      <div className="rounded-xl" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <div className="p-4 md:p-5" style={{ borderBottom: "1px solid #2d3757" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: "#f2f4ff" }}>Top Prospects</h2>
            <Link href="/prospects" className="text-xs" style={{ color: "#3399ff" }}>View all →</Link>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: "#2d3757" }}>
          {topProspects.length === 0 && (
            <div className="p-5 text-sm text-center" style={{ color: "#596494" }}>
              No prospects yet.{" "}
              <Link href="/prospects/new" style={{ color: "#3399ff" }}>Add your first →</Link>
            </div>
          )}
          {topProspects.map(p => {
            const scoreColor = p.score >= 85 ? "#22d68d" : p.score >= 70 ? "#ffa726" : "#3399ff";
            const stageColor = p.stage === "Converted" ? "#22d68d" : p.stage === "Lost" ? "#ff5959" : "#3399ff";
            return (
              <Link key={p.id} href={`/prospects/${p.id}`}
                className="flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "#3399ff20", color: "#3399ff" }}>{p.full_name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#f2f4ff" }}>{p.full_name}</div>
                  <div className="text-xs truncate" style={{ color: "#8d9ec7" }}>{p.company_name}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-base font-bold" style={{ color: scoreColor }}>{p.score}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${stageColor}20`, color: stageColor }}>{p.stage}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
