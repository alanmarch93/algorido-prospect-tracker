import { createClient } from "@/lib/supabase/server";
import { Prospect, Stage } from "@/lib/types";
import StageBadge from "@/components/StageBadge";
import Link from "next/link";

const STAGES: Stage[] = ["Outreach","Contacted","Interested","Demo Set","Converted"];

const stageColors: Record<string, string> = {
  Outreach: "#9966ff", Contacted: "#3399ff", Interested: "#ffa726",
  "Demo Set": "#ff8c42", Converted: "#22d68d",
};

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: prospects = [] } = await supabase
    .from("prospects").select("*").order("score", { ascending: false }) as { data: Prospect[] };

  const byStage = STAGES.reduce((acc, s) => {
    acc[s] = prospects.filter(p => p.stage === s);
    return acc;
  }, {} as Record<string, Prospect[]>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f2f4ff" }}>Pipeline Board</h1>
          <p className="text-sm mt-1" style={{ color: "#8d9ec7" }}>Kanban view of all prospects by stage</p>
        </div>
        <Link href="/prospects/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90"
          style={{ background: "#3399ff", color: "#0d0f1a" }}
        >
          + Add Prospect
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const list = byStage[stage] ?? [];
          const color = stageColors[stage];
          const value = list.filter(p => p.stage === "Converted").length * 100;
          return (
            <div key={stage} className="shrink-0 w-64 rounded-xl flex flex-col" style={{ background: "#161927", border: "1px solid #2d3757" }}>
              {/* Column header */}
              <div className="p-4" style={{ borderBottom: "1px solid #2d3757" }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-sm font-semibold" style={{ color: "#f2f4ff" }}>{stage}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}20`, color }}>
                    {list.length}
                  </span>
                </div>
                {stage === "Converted" && (
                  <div className="text-xs" style={{ color: "#22d68d" }}>${value}/mo MRR</div>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[600px]">
                {list.length === 0 && (
                  <div className="text-center py-8 text-xs" style={{ color: "#596494" }}>No prospects</div>
                )}
                {list.map(p => (
                  <Link key={p.id} href={`/prospects/${p.id}`}
                    className="block p-3 rounded-lg transition-all hover:opacity-80"
                    style={{ background: "#1e2338", border: "1px solid #2d3757" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${color}20`, color }}>
                        {p.full_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "#f2f4ff" }}>{p.full_name}</div>
                        <div className="text-xs truncate" style={{ color: "#596494" }}>{p.company_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1 rounded-full" style={{ background: "#2d3757" }}>
                          <div className="h-1 rounded-full" style={{ width: `${p.score}%`, background: p.score >= 85 ? "#22d68d" : p.score >= 70 ? "#ffa726" : "#3399ff" }} />
                        </div>
                        <span className="text-xs" style={{ color: "#596494" }}>{p.score}</span>
                      </div>
                      <span className="text-xs" style={{ color: "#596494" }}>{p.lead_source}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lost row */}
      {prospects.filter(p => p.stage === "Lost").length > 0 && (
        <div className="mt-6 rounded-xl p-5" style={{ background: "#161927", border: "1px solid #2d3757" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "#ff5959" }} />
            <span className="text-sm font-semibold" style={{ color: "#8d9ec7" }}>Lost</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#ff595920", color: "#ff5959" }}>
              {prospects.filter(p => p.stage === "Lost").length}
            </span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {prospects.filter(p => p.stage === "Lost").map(p => (
              <Link key={p.id} href={`/prospects/${p.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:opacity-80"
                style={{ background: "#1e2338", border: "1px solid #2d3757", color: "#8d9ec7" }}
              >
                {p.full_name} · {p.company_name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
