import { activityLegendItems, activityTheme } from "@/lib/calendar/day-activity-style";

export function ActivityLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)] ${className}`}>
      {activityLegendItems.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full border"
            style={{
              backgroundColor: `rgba(${activityTheme[item.key].rgb}, 0.78)`,
              borderColor: activityTheme[item.key].border,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
