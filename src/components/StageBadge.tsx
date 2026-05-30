import { Stage } from "@/lib/types";

const config: Record<Stage, { bg: string; color: string }> = {
  Outreach:  { bg: "#9966ff20", color: "#9966ff" },
  Contacted: { bg: "#3399ff20", color: "#3399ff" },
  Interested:{ bg: "#ffa72620", color: "#ffa726" },
  "Demo Set":{ bg: "#ffa72620", color: "#ffa726" },
  Converted: { bg: "#22d68d20", color: "#22d68d" },
  Lost:      { bg: "#ff595920", color: "#ff5959" },
};

export default function StageBadge({ stage }: { stage: Stage }) {
  const { bg, color } = config[stage] ?? config.Outreach;
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>
      {stage}
    </span>
  );
}
