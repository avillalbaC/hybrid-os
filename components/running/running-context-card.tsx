"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RunningObjectiveContext } from "@/lib/analytics/running-load";

export function RunningContextCard({
  context,
  isLoading,
}: {
  context: RunningObjectiveContext;
  isLoading?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  async function copyContext() {
    setCopyError(false);

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable.");
      }

      await navigator.clipboard.writeText(context.copyText);
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

  if (isLoading) {
    return (
      <Card>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Contexto de carrera</p>
        <div className="mt-4 space-y-3">
          <div className="h-20 animate-pulse rounded-md bg-[rgba(244,247,244,0.06)]" />
          <div className="h-20 animate-pulse rounded-md bg-[rgba(244,247,244,0.06)]" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Contexto de carrera</p>
          <h3 className="mt-3 text-xl font-black tracking-tight">{context.headline}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Lectura objetiva para preparar el check diario, sin cerrar la decisión dentro de la app.</p>
        </div>
        <Link href="/analysis" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver análisis completo
        </Link>
      </div>

      <div className="mt-4 grid gap-3">
        <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
          <Badge tone="accent">Señal principal</Badge>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{context.signalDetail}</p>
        </article>

        <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
          <Badge tone="neutral">Evidencia</Badge>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-strong)]">
            {context.evidence.slice(0, 4).map((item) => (
              <li key={item}>Dato relevante: {item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
          <Badge tone="warning">Contexto no-running</Badge>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{context.nonRunningContext}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{context.dailyCheckContext}</p>
        </article>
      </div>

      <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Datos insuficientes</p>
        {context.insufficientData.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm leading-6 text-[var(--muted-strong)]">
            {context.insufficientData.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">Sin huecos relevantes para esta lectura.</p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={copyContext}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          {copied ? "Copiado" : "Copiar contexto running"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-left text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:text-right"
        >
          {expanded ? "Ocultar texto" : "Ver texto copiable"}
        </button>
      </div>

      {expanded ? (
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-xs leading-6 text-[var(--muted-strong)]">
          {context.copyText}
        </pre>
      ) : null}

      {copyError ? (
        <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.28)] bg-[var(--warning-soft)] p-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">No se pudo copiar automáticamente. Selecciona el texto manualmente.</p>
          <textarea
            ref={textareaRef}
            readOnly
            value={context.copyText}
            className="mt-3 min-h-36 w-full rounded-md border border-[var(--line)] bg-[rgba(0,0,0,0.18)] p-3 text-xs leading-5 text-[var(--muted-strong)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          />
        </div>
      ) : null}
    </Card>
  );
}
