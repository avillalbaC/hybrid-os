"use client";

import { useMemo } from "react";
import {
  calculateMuscleGroups,
  detectMuscleImbalances,
  getMuscleLoadMax,
  getMuscleLoadTotal,
  getMusclePercent,
  getTopMuscles,
  getUnderusedMuscles,
} from "@/lib/domain/training/muscle-load";
import { formatMuscleName } from "@/lib/utils/format";
import type { MuscleName, SessionMuscleSummary } from "@/types/training";

export type BodyHeatmapProps = {
  muscleSummary: SessionMuscleSummary;
  runningDistanceMeters?: number;
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showTopMuscles?: boolean;
  className?: string;
};

function CompactMuscleList({
  empty,
  muscles,
}: {
  empty: string;
  muscles: Array<{ muscle: MuscleName; load: number; percentOfMax: number }>;
}) {
  if (muscles.length === 0) {
    return <p className="text-sm leading-6 text-[var(--muted)]">{empty}</p>;
  }

  return (
    <div className="space-y-2">
      {muscles.map((item) => (
        <div key={item.muscle} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-bold text-[var(--foreground)]">{formatMuscleName(item.muscle)}</p>
            <p className="font-mono text-sm font-black text-[var(--accent-strong)]">{item.load}</p>
          </div>
          <p className="mt-1 font-mono text-[0.68rem] font-bold text-[var(--muted)]">{item.percentOfMax}% del máximo</p>
        </div>
      ))}
    </div>
  );
}

function RatioRow({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}) {
  const total = leftValue + rightValue;
  const leftPercent = getMusclePercent(leftValue, total);
  const rightPercent = getMusclePercent(rightValue, total);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        <span>{leftLabel} {leftPercent}%</span>
        <span>{rightLabel} {rightPercent}%</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full border border-[var(--line)] bg-[rgba(244,247,244,0.05)]">
        <span
          className="bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
          style={{ width: `${leftPercent}%` }}
        />
        <span
          className="bg-[rgba(240,196,107,0.72)]"
          style={{ width: `${rightPercent}%` }}
        />
      </div>
    </div>
  );
}

export function BodyHeatmap({
  className = "",
  muscleSummary,
  runningDistanceMeters = 0,
  showLegend = true,
  showTopMuscles = true,
  subtitle = "Carga muscular acumulada",
  title = "Carga muscular",
}: BodyHeatmapProps) {
  const topMuscles = useMemo(() => getTopMuscles(muscleSummary, 5), [muscleSummary]);
  const underusedMuscles = useMemo(() => getUnderusedMuscles(muscleSummary, 5), [muscleSummary]);
  const alerts = useMemo(
    () => detectMuscleImbalances(muscleSummary, { runningDistanceMeters }),
    [muscleSummary, runningDistanceMeters],
  );
  const groups = useMemo(() => calculateMuscleGroups(muscleSummary), [muscleSummary]);
  const totalLoad = getMuscleLoadTotal(muscleSummary);
  const maxLoad = getMuscleLoadMax(muscleSummary);
  const groupByKey = new Map(groups.map((group) => [group.key, group]));
  const lowerBody = groupByKey.get("lowerBody");
  const upperBody = groupByKey.get("upperBody");
  const push = groupByKey.get("push");
  const pull = groupByKey.get("pull");
  const anterior = groupByKey.get("anteriorChain");
  const posterior = groupByKey.get("posteriorChain");

  return (
    <section className={`rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Carga muscular</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right">
          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 py-2">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Total</p>
            <p className="font-mono text-sm font-black text-[var(--foreground)]">{totalLoad}</p>
          </div>
          <div className="rounded-md border border-[rgba(240,196,107,0.22)] bg-[rgba(240,196,107,0.08)] px-3 py-2">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Máximo</p>
            <p className="font-mono text-sm font-black text-[var(--warning)]">{maxLoad}</p>
          </div>
        </div>
      </div>

      {totalLoad <= 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-5 text-sm leading-6 text-[var(--muted)]">
          No hay datos de carga muscular para este periodo.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {showTopMuscles ? (
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-4">
              <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Top cargados</p>
              <CompactMuscleList empty="Sin músculos cargados." muscles={topMuscles} />
            </div>
          ) : null}

          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-4">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Infrautilizados</p>
            <CompactMuscleList empty="No hay músculos claramente infrautilizados." muscles={underusedMuscles} />
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-4">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Alertas</p>
            <div className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.title} className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3">
                    <p className="text-sm font-bold text-[var(--warning)]">{alert.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-strong)]">{alert.detail}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--muted)]">Sin alertas de descompensación con los umbrales actuales.</p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-4">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Ratios principales</p>
            <div className="space-y-4">
              {upperBody && lowerBody ? (
                <RatioRow leftLabel="Superior" leftValue={upperBody.load} rightLabel="Inferior" rightValue={lowerBody.load} />
              ) : null}
              {push && pull ? <RatioRow leftLabel="Empuje" leftValue={push.load} rightLabel="Tracción" rightValue={pull.load} /> : null}
              {anterior && posterior ? (
                <RatioRow leftLabel="Anterior" leftValue={anterior.load} rightLabel="Posterior" rightValue={posterior.load} />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showLegend && totalLoad > 0 ? (
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          Infrautilizado = carga 0 o por debajo del 20% del músculo más cargado del periodo.
        </p>
      ) : null}
    </section>
  );
}
