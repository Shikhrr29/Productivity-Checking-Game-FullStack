import type { CSSProperties } from "react";
import type { DailyScore } from "@/lib/types";

const items = [
  ["Work", "work_component", 40],
  ["Gym", "gym_component", 20],
  ["Diet", "diet_component", 20],
  ["Energy", "energy_component", 15],
  ["Streak", "consistency_bonus", 5]
] as const;

export function ScoreBreakdown({ score }: { score: DailyScore }) {
  return (
    <div className="grid">
      {items.map(([label, key, max]) => (
        <div className="metric" key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>{label}</span>
            <strong style={{ fontSize: 15 }}>{score[key]}/{max}</strong>
          </div>
          <div className="barTrack">
            <div className="barFill" style={{ "--value": `${Math.min(100, (score[key] / max) * 100)}%` } as CSSProperties} />
          </div>
        </div>
      ))}
    </div>
  );
}
