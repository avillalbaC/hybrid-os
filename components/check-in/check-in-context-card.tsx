"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { CheckInContextData } from "@/types/check-in-context";

function formatKm(value: number | null) {
  return value === null ? "Sin dato" : `${value.toFixed(1)} km`;
}

function getSummaryItems(context: CheckInContextData) {
  return [
    `${context.training.sessionsCount} sesiones`,
    `${formatKm(context.training.totalRunKm)} carrera total`,
    `${formatKm(context.training.structuredRunKm)} running estructurado`,
    `${context.daily.dailyEntriesCount}/7 entradas Daily Plan`,
    `${context.daily.mobilityDays}/7 días movilidad`,
  ];
}

export function CheckInContextCard({
  context,
  text,
  compactText,
  compact = false,
  showDetails = true,
  detailHref,
  title = compact ? "Contexto de la semana" : "Contexto para check diario",
}: {
  context: CheckInContextData;
  text: string;
  compactText?: string;
  compact?: boolean;
  showDetails?: boolean;
  detailHref?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [expanded, setExpanded] = useState(!compact && showDetails);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const copyValue = compact ? compactText ?? text : text;
  const summaryItems = getSummaryItems(context);

  async function copyContext() {
    setCopyError(false);

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable.");
      }

      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
      window.setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    }
  }

  return (
    <Card className={compact ? "border-[rgba(34,211,238,0.16)]" : undefined}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{title}</p>
          <h3 className={compact ? "mt-2 text-xl font-black tracking-tight" : "mt-2 text-2xl font-black tracking-tight"}>
            {context.goal.title ?? "Resumen descriptivo"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {context.period.label} · {context.period.startDate} - {context.period.endDate}. Texto objetivo para pegar fuera de la app.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={copyContext}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            {copied ? "Copiado" : "Copiar contexto"}
          </button>
          {detailHref ? (
            <Link href={detailHref} className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
              Ver detalle
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {summaryItems.map((item) => (
          <p key={item} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm font-semibold text-[var(--muted-strong)]">
            {item}
          </p>
        ))}
      </div>

      {context.signals.positive.length > 0 || context.signals.negative.length > 0 || context.signals.insufficient.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <p className="rounded-md border border-[rgba(34,211,238,0.18)] bg-[var(--accent-faint)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
            <span className="block font-bold text-[var(--foreground)]">Señal a favor</span>
            {context.signals.positive[0] ?? "Sin señal positiva clara."}
          </p>
          <p className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
            <span className="block font-bold text-[var(--foreground)]">Señal en contra</span>
            {context.signals.negative[0] ?? "Sin señal negativa clara."}
          </p>
          <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
            <span className="block font-bold text-[var(--foreground)]">Dato insuficiente</span>
            {context.signals.insufficient[0] ?? "Sin huecos relevantes."}
          </p>
        </div>
      ) : null}

      {showDetails ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            {expanded ? "Ocultar detalle" : "Ver detalle"}
          </button>
          {expanded ? (
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-xs leading-6 text-[var(--muted-strong)]">
              {text}
            </pre>
          ) : null}
        </div>
      ) : null}

      {copyError ? (
        <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.28)] bg-[var(--warning-soft)] p-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">No se pudo copiar automáticamente. Selecciona el texto manualmente.</p>
          <textarea
            ref={textareaRef}
            readOnly
            value={copyValue}
            className="mt-3 min-h-36 w-full rounded-md border border-[var(--line)] bg-[rgba(0,0,0,0.18)] p-3 text-xs leading-5 text-[var(--muted-strong)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          />
        </div>
      ) : null}
    </Card>
  );
}
