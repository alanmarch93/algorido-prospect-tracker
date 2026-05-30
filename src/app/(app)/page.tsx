import { createClient } from "@/lib/supabase/server";
import { Prospect } from "@/lib/types";

const STAGES = ["Outreach","Contacted","Interested","Demo Set","Converted","Lost"];

function kpiColor(i: number) {
  return ["#3399ff","#22d68d","#9966ff","#ffa726"][i];
}

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

  const stageCounts = STAGES.map(s => ({ stage: s, count: prospects.filter(p => p.stage === s).length }));
  const recent = prospects.slice(0, 8);
  const topProspects = [...prospects].sort((a, b) => b.score - a.score).slice(0, 6);

  const kpis = [
    { label: "Total Prospects", value: String(total), sub: "tracked leads", color: kpiColor(0) },
    { label: "Qualified Leads", value: String(qualified), sub: `${total ? Math.round(qualified/total*100) : 0}% qualify`, color: kpiColor(1) },
    { label: "Converted Accounts", value: String(active), sub: `$${active * 100} MRR`, color: kpiColor(2) },
    { label: "Revenue Pipeline", value: `$${pipeline.toLocaleString()}`, sub: `${total} × $100`, color: kpiColor(3) },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#f2f4ff" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#8d9ec7" }}>Overview of your Algorido AI prospect pipeline</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-xl p-5 relative overflow-hidden" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <div className="text-xs font-medium mb-3" style={{ color: "#8d9ec7" }}>{k.label}</div>
            <div className="text-3xl font-extrabold mb-1" style={{ color: "#f2f4ff" }}>{k.value}</div>
            <div className="text-xs" style={{ color: "#8d9ec7" }}>{k.sub}</div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Pipeline Funnel */}
        <div className="rounded-xl p-5" style={{ background: "#161927", border: "1px solid #2d3757" }}>
          <h2 className="font-semibold mb-1" style={{ color: "#f2f4ff" }}>Pipeline Funnel</h2>
          <p className="text-xs mb-4" style={{ color: "#8d9ec7" }}>Prospects by stage</p>
          <div className="space-y-3">
            {stageCounts.filter(s => s.stage !== "Lost").map((s, i) => {
              const pct = total ? Math.round(s.count / total * 100) : 0;
              const colors = ["#3399ff","#9966ff","#ffa726","#ffa726","#22d68d"];
              return (
                <div key={s.stage} className="flex items-center gap-3">
                  <div className="w-24 text-xs shrink-0" style={{ color: "#8d9ec7" }}>{s.stage}</div>
                  <div className="w-8 text-xs font-semibold shrink-0 text-right" style={{ color: "#f2f4ff" }}>{s.count}</div>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "#2d3757" }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: colors[i] }} />
                  </div>
                  <div className="w-8 text-xs shrink-0" style={{ color: "#596494" }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Stats */}
        <div className="rounded-xl p-5" style={{ background: "#161927", border: "1px solid #2d3757" }}>
          <h2 className="font-semibold mb-1" style={{ color: "#f2f4ff" }}>Conversion Overview</h2>
          <p className="text-xs mb-4" style={{ color: "#8d9ec7" }}>Prospects → Active Accounts</p>
          <div className="text-5xl font-extrabold mb-2" style={{ color: "#3399ff" }}>
            {total ? Math.round(active / total * 100) : 0}%
          </div>
          <div className="text-sm mb-6" style={{ color: "#8d9ec7" }}>
            {active} converted out of {total} prospects
          </div>
          <div className="h-px mb-4" style={{ background: "#2d3757" }} />
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Account Value", val: "$100/mo", color: "#22d68d" },
              { label: "Total MRR", val: `$${active * 100}`, color: "#3399ff" },
              { label: "Lost Leads", val: String(prospects.filter(p => p.stage === "Lost").length), color: "#ff5959" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.val}</div>
                <div className="text-xs mt-0.5" style={{ color: "#596494" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Recent Prospects */}
        <div className="rounded-xl" style={{ background: "#161927", border: "1px solid #2d3757" }}>
          <div className="p-5" style={{ borderBottom: "1px solid #2d3757" }}>
            <h2 className="font-semibold" style={{ color: "#f2f4ff" }}>Recently Added</h2>
            <p className="text-xs mt-0.5" style={{ color: "#8d9ec7" }}>Latest prospects in the pipeline</p>
          </div>
          <div className="divide-y" style={{ borderColor: "#2d3757" }}>
            {recent.length === 0 && (
              <div className="p-5 text-sm text-center" style={{ color: "#596494" }}>No prospects yet. Add your first one!</div>
            )}
            {recent.map(p => (
              <a key={p.id} href={`/prospects/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#3399ff20", color: "#3399ff" }}>
                  {p.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#f2f4ff" }}>{p.full_name}</div>
                  <div className="text-xs truncate" style={{ color: "#8d9ec7" }}>{p.company_name}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{
                  background: p.stage === "Converted" ? "#22d68d20" : p.stage === "Lost" ? "#ff595920" : "#3399ff20",
                  color: p.stage === "Converted" ? "#22d68d" : p.stage === "Lost" ? "#ff5959" : "#3399ff",
                }}>{p.stage}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Top by Score */}
        <div className="rounded-xl" style={{ background: "#161927", border: "1px solid #2d3757" }}>
          <div className="p-5" style={{ borderBottom: "1px solid #2d3757" }}>
            <h2 className="font-semibold" style={{ color: "#f2f4ff" }}>Top Prospects by Score</h2>
            <p className="text-xs mt-0.5" style={{ color: "#8d9ec7" }}>Ranked by engagement & fit</p>
          </div>
          <div className="divide-y" style={{ borderColor: "#2d3757" }}>
            {topProspects.length === 0 && (
              <div className="p-5 text-sm text-center" style={{ color: "#596494" }}>No prospects yet.</div>
            )}
            {topProspects.map(p => {
              const scoreColor = p.score >= 85 ? "#22d68d" : p.score >= 70 ? "#ffa726" : "#3399ff";
              return (
                <a key={p.id} href={`/prospects/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#1e2338", color: "#3399ff" }}>
                    {p.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "#f2f4ff" }}>{p.full_name}</div>
                    <div className="text-xs truncate" style={{ color: "#8d9ec7" }}>{p.company_name}</div>
                  </div>
                  <div className="text-lg font-bold shrink-0" style={{ color: scoreColor }}>{p.score}</div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
