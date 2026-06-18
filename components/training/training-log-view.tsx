"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { dashboardPeriods, filterSessionsByPeriod, type DashboardPeriod } from "@/lib/domain/dashboard/periods";
import { getSessionRunMeters, getTotalRunExposureMeters } from "@/lib/domain/training/run-exposure";
import { getSecondaryActivityKind, isSecondaryActivity } from "@/lib/domain/training/secondary-activity";
import { calculateTotalDuration } from "@/lib/selectors/training";
import { useTrainingSessions, type TrainingSessionWithSync } from "@/lib/storage/use-training-sessions";
import { formatDataQuality, formatDuration, formatKm as formatDistanceKm, formatLoadKg, formatTag, formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession, TrainingSessionType } from "@/types/training";

type TypeFilter = "all" | TrainingSessionType | "partial" | "recovery" | "secondary" | "padel" | "routes-walks";
type SortMode = "recent" | "oldest" | "duration" | "rpe";

type SessionGroup = {
  date: string;
  label: string;
  weekLabel: string;
  sessions: TrainingSessionWithSync[];
};

const typeFilters: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "crossfit", label: "CrossFit" },
  { value: "hyrox", label: "HYROX" },
  { value: "running", label: "Running" },
  { value: "fuerza", label: "Fuerza" },
  { value: "halterofilia", label: "Halterofilia" },
  { value: "gimnasticos", label: "Gimnásticos" },
  { value: "partial", label: "Parciales" },
  { value: "recovery", label: "Movilidad / recovery" },
  { value: "secondary", label: "Actividad secundaria" },
  { value: "padel", label: "Pádel" },
  { value: "routes-walks", label: "Rutas/caminatas" },
];

const sortModes: Array<{ value: SortMode; label: string }> = [
  { value: "recent", label: "Más reciente primero" },
  { value: "oldest", label: "Más antiguo primero" },
  { value: "duration", label: "Mayor duración" },
  { value: "rpe", label: "Mayor RPE" },
];

function getSessionSearchText(session: TrainingSession) {
  const blockText = session.blocks
    .flatMap((block) => [
      block.name,
      block.format,
      block.blockResult,
      block.notes,
      ...block.exercises.flatMap((exercise) => [
        exercise.name,
        exercise.canonicalName,
        exercise.movementPattern,
        exercise.notes,
      ]),
    ])
    .filter(Boolean)
    .join(" ");

  return [
    session.title,
    session.objective,
    session.notes,
    session.result?.score,
    session.result?.notes,
    formatTrainingType(session.type),
    session.type,
    session.subtypes.join(" "),
    session.tags.join(" "),
    session.pendingFields.join(" "),
    blockText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesTypeFilter(session: TrainingSession, filter: TypeFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "recovery") {
    return session.type === "movilidad" || session.subtypes.includes("mobility") || session.tags.some((tag) => ["mobility", "recovery", "movilidad"].includes(tag));
  }

  if (filter === "partial") {
    return session.status === "partial" || session.dataQuality === "partial" || session.pendingFields.length > 0;
  }

  if (filter === "secondary") {
    return isSecondaryActivity(session);
  }

  if (filter === "padel") {
    return isSecondaryActivity(session) && getSecondaryActivityKind(session) === "padel";
  }

  if (filter === "routes-walks") {
    const kind = getSecondaryActivityKind(session);
    return isSecondaryActivity(session) && (kind === "route" || kind === "walking" || kind === "hiking");
  }

  return session.type === filter;
}

function formatKm(meters: number) {
  return meters > 0 ? formatDistanceKm(meters, { forceKm: true }) : "-";
}

function formatCompactDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function formatGroupDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getWeekInfo(date: string) {
  const current = new Date(`${date}T00:00:00`);
  const day = current.getDay() || 7;
  const monday = addDays(current, 1 - day);
  const sunday = addDays(monday, 6);
  const thursday = addDays(monday, 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const rangeFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });

  return `Semana ${week} · ${rangeFormatter.format(monday)}-${rangeFormatter.format(sunday)}`;
}

function getAverageRpeSummary(sessions: TrainingSession[]) {
  const rpeValues = sessions
    .map((session) => session.rpe)
    .filter((rpe): rpe is number => typeof rpe === "number" && rpe > 0);

  if (rpeValues.length === 0) {
    return { value: "-", count: 0 };
  }

  const total = rpeValues.reduce((sum, rpe) => sum + rpe, 0);
  return { value: (total / rpeValues.length).toFixed(1), count: rpeValues.length };
}

function getFrequentTypes(sessions: TrainingSession[]) {
  const counts = sessions.reduce<Record<string, number>>((result, session) => {
    const type = formatTrainingType(session.type);
    result[type] = (result[type] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type, count]) => `${type} ${count}`)
    .join(" · ");
}

function getSourceBadge(source: "loading" | "remote" | "seed-fallback") {
  if (source === "remote") {
    return { label: "Datos Supabase", tone: "accent" as const };
  }

  if (source === "seed-fallback") {
    return { label: "Fallback seed", tone: "warning" as const };
  }

  return { label: "Cargando datos", tone: "neutral" as const };
}

function getSessionScore(session: TrainingSession) {
  if (session.result?.score) {
    return session.result.score;
  }

  const blockResult = session.blocks.find((block) => block.blockResult)?.blockResult;

  if (blockResult) {
    return blockResult;
  }

  return session.objective ?? session.notes;
}

function getPrimarySubtypes(session: TrainingSession) {
  return session.subtypes
    .filter((subtype) => subtype !== session.type)
    .slice(0, 3);
}

function getExternalLoadLabel(session: TrainingSession) {
  const load = session.sessionMetrics.totalExternalLoadKg;
  return typeof load === "number" && load > 0 ? formatLoadKg(load) : null;
}

function getPendingLabel(session: TrainingSession) {
  if (session.pendingFields.length === 0) {
    return null;
  }

  return `${session.pendingFields.length} pendiente${session.pendingFields.length === 1 ? "" : "s"}`;
}

function sortSessions(sessions: TrainingSessionWithSync[], sortMode: SortMode) {
  return [...sessions].sort((a, b) => {
    if (sortMode === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }

    if (sortMode === "duration") {
      return (b.durationMinutes ?? 0) - (a.durationMinutes ?? 0) || new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    if (sortMode === "rpe") {
      return (b.rpe ?? 0) - (a.rpe ?? 0) || new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function groupSessionsByDate(sessions: TrainingSessionWithSync[]) {
  const groups = new Map<string, SessionGroup>();

  sessions.forEach((session) => {
    const currentGroup = groups.get(session.date);

    if (currentGroup) {
      currentGroup.sessions.push(session);
      return;
    }

    groups.set(session.date, {
      date: session.date,
      label: formatGroupDate(session.date),
      weekLabel: getWeekInfo(session.date),
      sessions: [session],
    });
  });

  return Array.from(groups.values());
}

function SessionRow({ session }: { session: TrainingSessionWithSync }) {
  const isPending = session.pendingSync || session.dataSource === "local-pending";
  const score = getSessionScore(session);
  const subtypes = getPrimarySubtypes(session);
  const visibleTags = session.tags.slice(0, 5);
  const hiddenTags = Math.max(session.tags.length - visibleTags.length, 0);
  const runMeters = getSessionRunMeters(session);
  const externalLoad = getExternalLoadLabel(session);
  const pendingLabel = getPendingLabel(session);

  return (
    <article className="grid gap-3 border-t border-[var(--line)] bg-[rgba(244,247,244,0.018)] px-3 py-3 transition hover:bg-[var(--accent-faint)] md:grid-cols-[84px_minmax(0,1fr)_minmax(220px,auto)] md:items-center md:px-4">
      <div className="flex items-center gap-2 md:block">
        <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[var(--accent)]">{formatCompactDate(session.date)}</p>
        {isPending ? <Badge tone="warning">pendingSync</Badge> : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{formatTrainingType(session.type)}</Badge>
          {subtypes.map((subtype) => (
            <Badge key={subtype}>{formatTag(subtype)}</Badge>
          ))}
          <Badge tone={session.dataQuality === "partial" || session.status === "partial" ? "warning" : "neutral"}>
            {formatDataQuality(session.dataQuality)}
          </Badge>
          {pendingLabel ? <Badge tone="warning">{pendingLabel}</Badge> : null}
          {session.dataSource === "remote" ? <Badge tone="accent">Supabase</Badge> : null}
          {session.dataSource === "seed" ? <Badge>Seed</Badge> : null}
        </div>
        <Link href={`/training/${session.id}`} className="mt-1 block truncate text-sm font-black tracking-tight text-[var(--foreground)] transition hover:text-[var(--accent-strong)]">
          {session.title}
        </Link>
        {score ? <p className="mt-1 truncate text-xs leading-5 text-[var(--muted)]">{score}</p> : null}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span key={tag} className="rounded border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.05em] text-[var(--muted-strong)]">
              {formatTag(tag)}
            </span>
          ))}
          {hiddenTags > 0 ? (
            <span className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[0.65rem] font-black text-[var(--muted)]">+{hiddenTags}</span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-5 md:min-w-[430px]">
        <p className="rounded border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-2 py-1 font-mono text-xs font-black text-[var(--foreground)]">{formatDuration(session.durationMinutes)}</p>
        <p className="rounded border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-2 py-1 font-mono text-xs font-black text-[var(--foreground)]">RPE {session.rpe ?? "-"}</p>
        <p className="rounded border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-2 py-1 font-mono text-xs font-black text-[var(--foreground)]">{formatKm(runMeters)}</p>
        <p className="rounded border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-2 py-1 font-mono text-xs font-black text-[var(--foreground)]">{externalLoad ?? "Sin kg"}</p>
        <Link
          href={`/training/${session.id}`}
          className="inline-flex min-h-8 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-2.5 py-1.5 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-strong)]"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

export function TrainingLogView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions, storedSessions, syncMessage, source, remoteError, exportBackup } = useTrainingSessions(seedSessions);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [period, setPeriod] = useState<DashboardPeriod>("all");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  useEffect(() => {
    const filter = new URLSearchParams(window.location.search).get("filter");

    if (filter === "secondary" || filter === "padel" || filter === "routes-walks") {
      setTypeFilter(filter);
    }
  }, []);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextSessions = filterSessionsByPeriod(sessions, period)
      .filter((session) => matchesTypeFilter(session, typeFilter))
      .filter((session) => !normalizedQuery || getSessionSearchText(session).includes(normalizedQuery)) as TrainingSessionWithSync[];

    return sortSessions(nextSessions, sortMode);
  }, [period, query, sessions, sortMode, typeFilter]);

  const rpeSummary = getAverageRpeSummary(filteredSessions);
  const totalRunMeters = getTotalRunExposureMeters(filteredSessions);
  const frequentTypes = getFrequentTypes(filteredSessions);
  const partialSessions = filteredSessions.filter((session) => session.status === "partial" || session.dataQuality === "partial").length;
  const pendingFieldsCount = filteredSessions.reduce((total, session) => total + session.pendingFields.length, 0);
  const groupedSessions = useMemo(() => groupSessionsByDate(filteredSessions), [filteredSessions]);
  const isRemoteError = source === "seed-fallback" && Boolean(remoteError);
  const sourceBadge = getSourceBadge(source);
  const isLoading = source === "loading";
  const hasAnySessions = sessions.length > 0;
  const hasActiveFilters = typeFilter !== "all" || period !== "all" || query.trim().length > 0;

  function clearFilters() {
    setTypeFilter("all");
    setPeriod("all");
    setQuery("");
  }

  return (
    <>
      <PageHeader
        eyebrow="Training log"
        title="Entrenamientos"
        description="Histórico filtrable para revisar sesiones, carga y calidad de datos sin mezclar seed cuando Supabase tiene registros reales."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/training/import"
              className="inline-flex rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
            >
              Importar JSON
            </Link>
            <button
              type="button"
              onClick={exportBackup}
              className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
            >
              Exportar backup
            </button>
          </div>
        }
      />

      <section className="mb-5 flex flex-wrap gap-2">
        <Badge tone={sourceBadge.tone}>{sourceBadge.label}</Badge>
        {storedSessions.length > 0 ? <Badge tone="warning">Pendientes locales · {storedSessions.length}</Badge> : null}
      </section>

      {isRemoteError ? (
        <Card className="mb-5 border-[rgba(240,196,107,0.32)]">
          <p className="text-sm font-semibold text-[var(--warning)]">No se pudo cargar Supabase.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{syncMessage ?? remoteError}</p>
        </Card>
      ) : syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <section className="mb-4 grid gap-2 rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-3 sm:grid-cols-2 xl:grid-cols-5">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Sesiones</p>
          <p className="mt-1 font-mono text-2xl font-black text-[var(--foreground)]">{filteredSessions.length}</p>
        </div>
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Duración</p>
          <p className="mt-1 font-mono text-2xl font-black text-[var(--foreground)]">{formatDuration(calculateTotalDuration(filteredSessions))}</p>
        </div>
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Carrera total</p>
          <p className="mt-1 font-mono text-2xl font-black text-[var(--foreground)]">{formatDistanceKm(totalRunMeters, { forceKm: true })}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{formatDistanceKm(totalRunMeters, { forceKm: true })} de exposición</p>
        </div>
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">RPE medio</p>
          <p className="mt-1 font-mono text-2xl font-black text-[var(--foreground)]">{rpeSummary.value}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{rpeSummary.count} con RPE</p>
        </div>
        <div className="sm:col-span-2 xl:col-span-1">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Tipos frecuentes</p>
          <p className="mt-2 text-sm font-semibold leading-5 text-[var(--foreground)]">{frequentTypes || "-"}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {partialSessions} parciales · {pendingFieldsCount} campos pendientes
          </p>
        </div>
      </section>

      <Card className="mb-4 p-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,0.8fr)_1.4fr_0.8fr_0.8fr_auto] xl:items-end">
          <label className="block text-sm font-semibold">
            Búsqueda
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Título, tipo, tag, ejercicio o nota"
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-border-strong)]"
            />
          </label>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Tipo</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setTypeFilter(filter.value)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-bold transition ${
                    typeFilter === filter.value
                      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)] hover:border-[var(--accent-border)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Periodo</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dashboardPeriods.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPeriod(item.value)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-bold transition ${
                    period === item.value
                      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)] hover:border-[var(--accent-border)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-semibold">
            Orden
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-border-strong)]"
            >
              {sortModes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-xs font-bold text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpiar filtros
          </button>
        </div>
      </Card>

      {storedSessions.length > 0 ? (
        <section className="mb-5 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
          <p className="text-sm font-semibold text-[var(--warning)]">Sesiones pendientes de sincronizar</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted-strong)]">
            {storedSessions.map((session) => (
              <li key={session.id}>{session.date} · {session.title}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {isLoading ? (
        <Card>
          <p className="text-lg font-semibold">Cargando entrenamientos.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Consultando Supabase y preparando el histórico.</p>
        </Card>
      ) : !hasAnySessions ? (
        <Card>
          <p className="text-lg font-semibold">No hay entrenamientos disponibles.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Cuando Supabase devuelva sesiones reales aparecerán aquí. Si hay sesiones locales, se mostrarán como pendientes hasta sincronizarse.
          </p>
          <Link
            href="/training/import"
            className="mt-4 inline-flex rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
          >
            Importar entrenamiento
          </Link>
        </Card>
      ) : filteredSessions.length > 0 ? (
        <section className="space-y-4">
          {groupedSessions.map((group) => (
            <div key={group.date} className="overflow-hidden rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
              <div className="flex flex-col gap-1 border-b border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)]">{group.label}</h2>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {group.weekLabel} · {group.sessions.length} {group.sessions.length === 1 ? "sesión" : "sesiones"}
                </p>
              </div>
              <div>
                {group.sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <Card>
          <p className="text-lg font-semibold">No hay sesiones con estos filtros.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Prueba con otro periodo, limpia la búsqueda o cambia el tipo de entrenamiento.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
          >
            Limpiar filtros
          </button>
        </Card>
      )}
    </>
  );
}
