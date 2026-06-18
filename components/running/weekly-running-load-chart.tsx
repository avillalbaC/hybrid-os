import { ChartCard } from "@/components/charts/chart-card";
import type { WeeklyRunningLoadDatum } from "@/lib/analytics/running-load";

function getAxisMax(maxKm: number) {
  if (maxKm <= 0) {
    return 5;
  }

  return Math.max(5, Math.ceil(maxKm / 5) * 5);
}

function getAxisTicks(axisMax: number) {
  const step = axisMax <= 20 ? 5 : Math.max(5, Math.ceil(axisMax / 4 / 5) * 5);
  const ticks: number[] = [];

  for (let value = 0; value <= axisMax; value += step) {
    ticks.push(value);
  }

  if (ticks[ticks.length - 1] !== axisMax) {
    ticks.push(axisMax);
  }

  return ticks;
}

function formatKm(value: number) {
  return `${value.toFixed(1)} km`;
}

function formatRpe(value: number | null) {
  return value === null ? "sin dato" : `${value.toFixed(1)}/10`;
}

export function WeeklyRunningLoadChart({
  data,
  isLoading,
}: {
  data: WeeklyRunningLoadDatum[];
  isLoading?: boolean;
}) {
  const hasData = data.some((week) => week.totalRunKm > 0 || week.nonRunningLoadRaw > 0);
  const axisMax = getAxisMax(Math.max(...data.map((week) => week.totalRunKm), 0));
  const axisTicks = getAxisTicks(axisMax);
  const latest = data[data.length - 1];

  return (
    <ChartCard
      title="Carga semanal y carrera"
      description="Kilómetros de carrera comparados con carga no-running normalizada."
      unit="km"
      currentValue={latest ? formatKm(latest.totalRunKm) : undefined}
      meta={latest ? [
        { label: "Running", value: formatKm(latest.structuredRunKm) },
        { label: "Mixto", value: formatKm(latest.mixedRunKm) },
        { label: "No-running", value: latest.nonRunningLoadLabel },
      ] : undefined}
      status={{ label: "Sombreado = carga no-running relativa", tone: "neutral" }}
      isLoading={isLoading}
      isEmpty={!isLoading && !hasData}
      emptyLabel="Sin carrera ni carga no-running en el rango visible."
      footer="El sombreado indica carga relativa de sesiones no-running; no equivale a kilómetros."
    >
      <div className="min-w-0">
        <div className="grid grid-cols-[46px_minmax(0,1fr)] gap-3">
          <div className="relative h-72">
            {axisTicks.map((tick) => (
              <span
                key={tick}
                className="absolute right-0 translate-y-1/2 font-mono text-[0.68rem] font-bold text-[var(--muted)]"
                style={{ bottom: `${(tick / axisMax) * 100}%` }}
              >
                {tick} km
              </span>
            ))}
          </div>

          <div className="relative h-72 overflow-hidden rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] px-3 pb-8 pt-4">
            {axisTicks.map((tick) => (
              <span
                key={tick}
                aria-hidden="true"
                className="absolute left-3 right-3 border-t border-[rgba(244,247,244,0.07)]"
                style={{ bottom: `calc(2rem + ${(tick / axisMax) * (100 - 16)}%)` }}
              />
            ))}
            <div className="relative z-10 flex h-full items-end gap-2">
              {data.map((week) => {
                const totalHeight = week.totalRunKm > 0 ? Math.max(5, (week.totalRunKm / axisMax) * 100) : 0;
                const structuredHeight = week.totalRunKm > 0 ? (week.structuredRunKm / week.totalRunKm) * 100 : 0;
                const mixedHeight = week.totalRunKm > 0 ? (week.mixedRunKm / week.totalRunKm) * 100 : 0;
                const shadeHeight = Math.round(week.nonRunningLoadNormalized * 100);
                const tooltip = [
                  `${week.weekLabel}`,
                  `Carrera total: ${formatKm(week.totalRunKm)}`,
                  `Running estructurado: ${formatKm(week.structuredRunKm)}`,
                  `Carrera mixta: ${formatKm(week.mixedRunKm)}`,
                  `Sesiones no-running: ${week.nonRunningSessions}`,
                  `Duración no-running: ${week.nonRunningDurationMinutes} min`,
                  `RPE medio no-running: ${formatRpe(week.nonRunningAverageRpe)}`,
                  `Carga no-running normalizada: ${week.nonRunningLoadLabel}`,
                ].join(" · ");

                return (
                  <div key={week.weekKey} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="absolute bottom-8 left-0 right-0 rounded-t-sm border-t border-[rgba(240,196,107,0.28)] bg-[linear-gradient(180deg,rgba(240,196,107,0.22),rgba(240,196,107,0.05))] opacity-80"
                      style={{ height: `${shadeHeight}%` }}
                      aria-hidden="true"
                    />
                    <div className="relative flex h-full w-full items-end justify-center">
                      <div
                        className="flex w-full max-w-12 flex-col-reverse overflow-hidden rounded-sm border border-[rgba(34,211,238,0.18)] bg-[rgba(34,211,238,0.08)] shadow-[0_0_26px_rgba(34,211,238,0.12)]"
                        style={{ height: `${totalHeight}%` }}
                        title={tooltip}
                        aria-label={tooltip}
                      >
                        <span className="block bg-[linear-gradient(180deg,var(--accent),var(--accent-strong))]" style={{ height: `${structuredHeight}%` }} />
                        <span className="block bg-[rgba(45,212,191,0.58)]" style={{ height: `${mixedHeight}%` }} />
                      </div>
                    </div>
                    <span className="absolute bottom-0 w-full truncate text-center font-mono text-[0.62rem] font-bold text-[var(--muted)]">
                      {week.weekKey.replace(/^.*-W/, "W")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--accent)]" /> Running estructurado</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[rgba(45,212,191,0.58)]" /> Carrera mixta</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-[rgba(240,196,107,0.35)] bg-[rgba(240,196,107,0.2)]" /> Carga no-running normalizada</span>
        </div>
      </div>
    </ChartCard>
  );
}
