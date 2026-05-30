import { createClient } from "@/lib/supabase/server";
import { Prospect, Stage } from "@/lib/types";
import Link from "next/link";
import StageBadge from "@/components/StageBadge";
import ScoreBar from "@/components/ScoreBar";

const STAGES: Stage[] = ["Outreach","Contacted","Interested","Demo Set","Converted","Lost"];

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("prospects").select("*").order("created_at", { ascending: false });
  if (params.stage && params.stage !== "All") query = query.eq("stage", params.stage);

  const { data: prospects = [] } = await query as { data: Prospect[] };
  const { data: all = [] } = await supabase.from("prospects").select("id,stage") as { data: Pick<Prospect,"id"|"stage">[] };

  const counts: Record<string, number> = { All: all.length };
  STAGES.forEach(s => { counts[s] = all.filter(p => p.stage === s).length; });
  const activeStage = params.stage ?? "All";

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "#f2f4ff" }}>Prospects</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: "#8d9ec7" }}>Market Maker Volume Bot · Algorido AI</p>
        </div>
        <Link href="/prospects/new"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 md:px-4 md:py-2.5"
          style={{ background: "#3399ff", color: "#0d0f1a" }}>
          + Add
        </Link>
      </div>

      {/* Stage tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {["All", ...STAGES].map(s => (
          <Link key={s} href={s === "All" ? "/prospects" : `/prospects?stage=${s}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all"
            style={{
              background: activeStage === s ? "#3399ff20" : "#161927",
              color: activeStage === s ? "#3399ff" : "#8d9ec7",
              border: `1px solid ${activeStage === s ? "#3399ff" : "#2d3757"}`,
            }}>
            {s}
            <span className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: activeStage === s ? "#3399ff" : "#1e2338", color: activeStage === s ? "#0d0f1a" : "#596494" }}>
              {counts[s] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {prospects.length === 0 && (
          <div className="text-center py-12 text-sm rounded-xl" style={{ background: "#161927", border: "1px solid #2d3757", color: "#596494" }}>
            No prospects found.{" "}
            <Link href="/prospects/new" style={{ color: "#3399ff" }}>Add one →</Link>
          </div>
        )}
        {prospects.map(p => (
          <Link key={p.id} href={`/prospects/${p.id}`}
            className="block rounded-xl p-4 transition-colors hover:opacity-90"
            style={{ background: "#161927", border: "1px solid #2d3757" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                style={{ background: "#3399ff20", color: "#3399ff" }}>{p.full_name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate" style={{ color: "#f2f4ff" }}>{p.full_name}</div>
                  <StageBadge stage={p.stage} />
                </div>
                <div className="text-xs mt-0.5 mb-2" style={{ color: "#8d9ec7" }}>{p.company_name}</div>
                <div className="flex items-center justify-between">
                  <div className="w-32"><ScoreBar score={p.score} /></div>
                  <div className="text-xs font-semibold" style={{ color: "#596494" }}>
                    {p.lead_source}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #2d3757", background: "#1e2338" }}>
              {["Prospect","Company","Stage","Score","Source","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#596494" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prospects.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm" style={{ color: "#596494" }}>
                  No prospects.{" "}
                  <Link href="/prospects/new" style={{ color: "#3399ff" }}>Add your first →</Link>
                </td>
              </tr>
            )}
            {prospects.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < prospects.length-1 ? "1px solid #2d3757" : undefined }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: "#3399ff20", color: "#3399ff" }}>{p.full_name[0]}</div>
                    <div>
                      <div className="font-medium" style={{ color: "#f2f4ff" }}>{p.full_name}</div>
                      <div className="text-xs" style={{ color: "#596494" }}>{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "#8d9ec7" }}>{p.company_name}</td>
                <td className="px-4 py-3"><StageBadge stage={p.stage} /></td>
                <td className="px-4 py-3 w-32"><ScoreBar score={p.score} /></td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: "#596494" }}>{p.lead_source}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/prospects/${p.id}`} className="text-xs font-medium" style={{ color: "#3399ff" }}>View</Link>
                    <Link href={`/prospects/${p.id}/edit`} className="text-xs font-medium" style={{ color: "#8d9ec7" }}>Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs" style={{ color: "#596494" }}>
        {prospects.length} prospect{prospects.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
