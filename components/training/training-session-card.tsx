import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDataQuality, formatDate, formatTag, formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

export function TrainingSessionCard({
  session,
  syncStatus,
  onDelete,
}: {
  session: TrainingSession;
  syncStatus?: "remote" | "pending" | "seed";
  onDelete?: (id: string) => void;
}) {
  return (
    <article className="group rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-[rgba(56,217,159,0.28)] hover:shadow-[0_26px_90px_rgba(0,0,0,0.34)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{formatDate(session.date)}</p>
            {session.dateConfidence === "inferred" ? <Badge tone="warning">fecha inferida</Badge> : null}
            {session.source === "import" ? <Badge>importado</Badge> : null}
            {session.dataQuality ? <Badge>{formatDataQuality(session.dataQuality)}</Badge> : null}
            {syncStatus === "remote" ? <Badge tone="accent">Supabase</Badge> : null}
            {syncStatus === "pending" ? <Badge tone="warning">pendiente local</Badge> : null}
            {syncStatus === "seed" ? <Badge>seed</Badge> : null}
          </div>
          <Link href={`/training/${session.id}`} className="mt-2 block text-lg font-black tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent-strong)]">
            {session.title}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent">{formatTrainingType(session.type)}</Badge>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(session.id)}
              className="rounded-md border border-[var(--line)] px-3 py-1 text-xs font-bold text-[var(--muted-strong)] transition hover:border-[rgba(240,196,107,0.5)] hover:text-[var(--warning)]"
            >
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Duración</p>
          <p className="mt-1 font-mono text-lg font-black text-[var(--foreground)]">{session.durationMinutes ?? "-"}m</p>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">RPE</p>
          <p className="mt-1 font-mono text-lg font-black text-[var(--foreground)]">{session.rpe ?? "-"}/10</p>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Feeling</p>
          <p className="mt-1 font-mono text-lg font-black text-[var(--foreground)]">{session.feeling ?? "-"}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
        {session.tags.map((tag) => (
          <Badge key={tag}>{formatTag(tag)}</Badge>
        ))}
      </div>
    </article>
  );
}
