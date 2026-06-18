"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export function CheckInContextCard({ context }: { context: string }) {
  const [copied, setCopied] = useState(false);

  async function copyContext() {
    await navigator.clipboard.writeText(context);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Contexto para check diario</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Resumen copiable</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Texto plano para pegar en el check diario. No se envía a ningún servicio externo.
          </p>
        </div>
        <button
          type="button"
          onClick={copyContext}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          {copied ? "Copiado" : "Copiar contexto"}
        </button>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-xs leading-6 text-[var(--muted-strong)]">
        {context}
      </pre>
    </Card>
  );
}
