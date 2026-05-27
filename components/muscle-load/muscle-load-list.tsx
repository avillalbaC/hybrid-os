import { ProgressBar } from "@/components/ui/progress-bar";
import type { MuscleTotal } from "@/lib/selectors/training";
import { formatMuscleName } from "@/lib/utils/format";

export function MuscleLoadList({ muscles }: { muscles: MuscleTotal[] }) {
  const max = Math.max(...muscles.map((item) => item.loadScore), 1);

  return (
    <div className="space-y-3">
      {muscles.map((item, index) => (
        <div key={item.muscle} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.68rem] font-bold text-[var(--muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-sm font-bold text-[var(--foreground)]">{formatMuscleName(item.muscle)}</p>
            </div>
            <p className="font-mono text-sm font-black text-[var(--accent-strong)]">{item.loadScore}</p>
          </div>
          <ProgressBar value={(item.loadScore / max) * 100} />
        </div>
      ))}
    </div>
  );
}
