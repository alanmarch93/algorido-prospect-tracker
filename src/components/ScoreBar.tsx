export default function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "#22d68d" : score >= 70 ? "#ffa726" : "#3399ff";
  return (
    <div className="flex items-center gap-2">
      <span className="text-base font-bold w-8 text-right" style={{ color }}>{score}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#2d3757" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}
