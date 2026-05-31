import type { CSSProperties } from "react";
import type { DailyScore } from "@/lib/types";

type TrendScore = DailyScore & { log_date?: string };

export function TrendBars({ scores }: { scores: TrendScore[] }) {
  const lastSeven = scores.slice(-7);
  const emptyDays = Array<null>(Math.max(0, 7 - lastSeven.length)).fill(null);
  const padded: Array<TrendScore | null> = [...emptyDays, ...lastSeven];

  return (
    <div className="trend" aria-label="Seven day productivity trend">
      {padded.map((score, index) => (
        <div
          className="trendBar"
          key={`${score?.log_date ?? "empty"}-${index}`}
          title={score ? `${score.total_score}` : "No log"}
          style={{ "--height": `${score ? Math.max(8, score.total_score) : 8}%`, opacity: score ? 1 : 0.24 } as CSSProperties}
        />
      ))}
    </div>
  );
}
