import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Prospect, Activity } from "@/lib/types";
import StageBadge from "@/components/StageBadge";
import ScoreBar from "@/components/ScoreBar";
import Link from "next/link";

const STAGES = ["Outreach","Contacted","Interested","Demo Set","Converted","Lost"];

const activityIcon: Record<string, string> = {
  created: "◉", note: "📝", email: "✉", call: "☎", demo: "📅", status_change: "⚡",
};

export default async function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prospect } = await supabase.from("prospects").select("*").eq("id", id).single() as { data: Prospect };
  if (!prospect) notFound();

  const { data: activities = [] } = await supabase
    .from("activities").select("*").eq("prospect_id", id).order("created_at", { ascending: false }) as { data: Activity[] };

  const stageIdx = STAGES.indexOf(prospect.stage);

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/prospects" className="text-sm hover:opacity-80" style={{ color: "#3399ff" }}>← Back to Prospects</Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left col */}
        <div className="col-span-2 space-y-4">
          {/* Profile card */}
          <div className="rounded-xl p-6" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0" style={{ background: "#3399ff20", color: "#3399ff" }}>
                {prospect.full_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold" style={{ color: "#f2f4ff" }}>{prospect.full_name}</h1>
                  <StageBadge stage={prospect.stage} />
                </div>
                <div className="text-sm mt-1" style={{ color: "#8d9ec7" }}>{prospect.company_name}</div>
                <div className="flex gap-4 mt-3 text-sm flex-wrap">
                  {prospect.email && <a href={`mailto:${prospect.email}`} style={{ color: "#596494" }}>✉ {prospect.email}</a>}
                  {prospect.phone && <span style={{ color: "#596494" }}>☎ {prospect.phone}</span>}
                  {prospect.website && <a href={prospect.website} target="_blank" rel="noreferrer" style={{ color: "#3399ff" }}>🌐 {prospect.website}</a>}
                  {prospect.linkedin_url && <a href={prospect.linkedin_url} target="_blank" rel="noreferrer" style={{ color: "#3399ff" }}>in LinkedIn</a>}
                </div>
              </div>
              <div className="shrink-0 w-32">
                <div className="text-xs font-semibold mb-2 text-center" style={{ color: "#596494" }}>SCORE</div>
                <ScoreBar score={prospect.score} />
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="rounded-xl p-6" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <h2 className="font-semibold mb-4" style={{ color: "#f2f4ff" }}>Prospect Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Lead Source", prospect.lead_source],
                ["Bot Plan", "Market Maker Volume Bot"],
                ["Added", new Date(prospect.created_at).toLocaleDateString()],
                ["Last Updated", new Date(prospect.updated_at).toLocaleDateString()],
                ["Converted On", prospect.converted_at ? new Date(prospect.converted_at).toLocaleDateString() : "—"],
                ["Amount Invested", prospect.amount_invested != null ? `$${Number(prospect.amount_invested).toLocaleString()}` : "—"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-xs mb-0.5" style={{ color: "#596494" }}>{label}</div>
                  <div className="font-medium" style={{ color: "#f2f4ff" }}>{val}</div>
                </div>
              ))}
            </div>
            {prospect.notes && (
              <>
                <div className="h-px my-4" style={{ background: "#2d3757" }} />
                <div className="text-xs mb-1" style={{ color: "#596494" }}>Notes</div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "#8d9ec7" }}>{prospect.notes}</p>
              </>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="rounded-xl p-6" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <h2 className="font-semibold mb-4" style={{ color: "#f2f4ff" }}>Activity Timeline</h2>
            {activities.length === 0 && (
              <p className="text-sm" style={{ color: "#596494" }}>No activity recorded yet.</p>
            )}
            <div className="space-y-4">
              {activities.map((a, i) => (
                <div key={a.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0" style={{ background: "#1e2338", color: "#3399ff" }}>
                      {activityIcon[a.type] ?? "◉"}
                    </div>
                    {i < activities.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: "#2d3757" }} />}
                  </div>
                  <div className="pb-4">
                    <div className="font-medium text-sm" style={{ color: "#f2f4ff" }}>{a.title}</div>
                    <div className="text-xs mt-0.5 mb-1" style={{ color: "#596494" }}>{new Date(a.created_at).toLocaleString()}</div>
                    {a.body && <p className="text-sm" style={{ color: "#8d9ec7" }}>{a.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Stage tracker */}
          <div className="rounded-xl p-5" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <h2 className="font-semibold mb-4" style={{ color: "#f2f4ff" }}>Pipeline Stage</h2>
            <div className="space-y-2">
              {STAGES.map((s, i) => {
                const done = i < stageIdx;
                const current = i === stageIdx;
                return (
                  <div key={s} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{
                    background: current ? "#22d68d15" : "transparent",
                    border: current ? "1px solid #22d68d40" : "1px solid transparent",
                  }}>
                    <span style={{ color: done || current ? (current ? "#22d68d" : "#3399ff") : "#596494" }}>
                      {done ? "✓" : current ? "●" : "○"}
                    </span>
                    <span className="text-sm" style={{ color: done || current ? "#f2f4ff" : "#596494", fontWeight: current ? 600 : 400 }}>{s}</span>
                    {current && <span className="text-xs ml-auto" style={{ color: "#22d68d" }}>Current</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl p-5" style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <h2 className="font-semibold mb-4" style={{ color: "#f2f4ff" }}>Quick Actions</h2>
            <div className="space-y-2">
              <Link href={`/prospects/${prospect.id}/edit`}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{ background: "#3399ff20", color: "#3399ff" }}
              >
                ✏ Edit Prospect
              </Link>
              {prospect.email && (
                <a href={`mailto:${prospect.email}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                  style={{ background: "#9966ff20", color: "#9966ff" }}
                >
                  ✉ Send Email
                </a>
              )}
              <a href="https://dash.algorido.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{ background: "#22d68d20", color: "#22d68d" }}
              >
                ⬡ Open Algorido Dashboard
              </a>
            </div>
          </div>

          {/* Amount Invested — shown only for converted prospects */}
          {prospect.stage === "Converted" && (
            <div className="rounded-xl p-5" style={{ background: "#22d68d10", border: "1px solid #22d68d40" }}>
              <div className="text-xs font-semibold mb-1" style={{ color: "#22d68d" }}>AMOUNT INVESTED IN AI BOT</div>
              {prospect.amount_invested != null ? (
                <>
                  <div className="text-3xl font-extrabold" style={{ color: "#f2f4ff" }}>
                    ${Number(prospect.amount_invested).toLocaleString()}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#8d9ec7" }}>USD · Market Maker Volume Bot</div>
                </>
              ) : (
                <div className="text-sm" style={{ color: "#8d9ec7" }}>
                  Not recorded yet.{" "}
                  <a href={`/prospects/${prospect.id}/edit`} style={{ color: "#22d68d" }}>Add amount →</a>
                </div>
              )}
            </div>
          )}

          {/* Algorido link */}
          <div className="rounded-xl p-5" style={{ background: "#3399ff15", border: "1px solid #3399ff30" }}>
            <div className="text-xs font-semibold mb-1" style={{ color: "#3399ff" }}>PLATFORM</div>
            <div className="text-sm font-bold mb-1" style={{ color: "#f2f4ff" }}>Algorido AI</div>
            <div className="text-xs mb-3" style={{ color: "#8d9ec7" }}>Market Maker Volume Bot</div>
            <a href="https://dash.algorido.com" target="_blank" rel="noreferrer"
              className="text-xs font-semibold" style={{ color: "#3399ff" }}>
              Open Dashboard ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
