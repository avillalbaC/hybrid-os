"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarDayDetailPanel } from "@/components/calendar/calendar-day-detail-panel";
import { CalendarMonthSummary } from "@/components/calendar/calendar-month-summary";
import { DisciplineMonthBreakdown } from "@/components/calendar/discipline-month-breakdown";
import { TrainingCalendarGrid } from "@/components/calendar/training-calendar-grid";
import { TrainingCalendarPageHeader } from "@/components/calendar/training-calendar-page-header";
import { buildCalendarMonthData } from "@/lib/analytics/calendar-data";
import {
  addMonthsToDateKey,
  getCalendarGridRange,
  getLocalDateKey,
  getMonthStart,
} from "@/lib/date/local-date";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import type { DailyEntry } from "@/types/daily";
import type { TrainingSession } from "@/types/training";

type DailyEntriesRangeResponse = {
  entries?: DailyEntry[];
};

function getSourceBadge(source: "loading" | "remote" | "seed-fallback") {
  if (source === "remote") {
    return { label: "Datos Supabase", tone: "accent" as const };
  }

  if (source === "seed-fallback") {
    return { label: "Fallback seed", tone: "warning" as const };
  }

  return { label: "Cargando datos", tone: "neutral" as const };
}

function minDateKey(...dates: Array<string | null | undefined>) {
  return dates.filter((date): date is string => Boolean(date)).sort()[0] ?? getLocalDateKey();
}

function maxDateKey(...dates: Array<string | null | undefined>) {
  const validDates = dates.filter((date): date is string => Boolean(date)).sort();
  return validDates[validDates.length - 1] ?? getLocalDateKey();
}

function getEarliestSessionDate(sessions: TrainingSession[]) {
  return sessions.map((session) => session.date).sort()[0] ?? null;
}

export function TrainingCalendarView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const todayDate = getLocalDateKey();
  const [monthDate, setMonthDate] = useState(getMonthStart(todayDate));
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [dailyEntriesError, setDailyEntriesError] = useState<string | null>(null);
  const [dailyEntriesLoading, setDailyEntriesLoading] = useState(false);
  const { sessions, source, syncMessage, remoteError, isLoading } = useTrainingSessions(seedSessions);
  const gridRange = useMemo(() => getCalendarGridRange(monthDate), [monthDate]);
  const dailyRange = useMemo(() => {
    const earliestSessionDate = getEarliestSessionDate(sessions);

    return {
      start: minDateKey(gridRange.start, earliestSessionDate, getMonthStart(todayDate)),
      end: maxDateKey(gridRange.end, todayDate),
    };
  }, [gridRange.end, gridRange.start, sessions, todayDate]);

  useEffect(() => {
    const dateParam = new URLSearchParams(window.location.search).get("date");

    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return;
    }

    setMonthDate(getMonthStart(dateParam));
    setSelectedDate(dateParam);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDailyEntries() {
      setDailyEntriesLoading(true);
      setDailyEntriesError(null);

      try {
        const response = await fetch(`/api/daily-entry/range?start=${dailyRange.start}&end=${dailyRange.end}`, {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las entradas diarias.");
        }

        const payload = (await response.json()) as DailyEntriesRangeResponse;
        setDailyEntries(Array.isArray(payload.entries) ? payload.entries : []);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setDailyEntries([]);
        setDailyEntriesError(error instanceof Error ? error.message : "No se pudieron cargar las entradas diarias.");
      } finally {
        if (!abortController.signal.aborted) {
          setDailyEntriesLoading(false);
        }
      }
    }

    void loadDailyEntries();

    return () => abortController.abort();
  }, [dailyRange.end, dailyRange.start]);

  const calendar = useMemo(
    () => buildCalendarMonthData({ sessions, dailyEntries, monthDate, selectedDate, todayDate }),
    [dailyEntries, monthDate, selectedDate, sessions, todayDate],
  );
  const selectedDay = calendar.days.find((day) => day.date === selectedDate) ?? null;
  const sourceBadge = getSourceBadge(source);
  const isRemoteError = source === "seed-fallback" && Boolean(remoteError);

  function goToPreviousMonth() {
    const nextMonth = getMonthStart(addMonthsToDateKey(monthDate, -1));
    setMonthDate(nextMonth);
    setSelectedDate(nextMonth);
  }

  function goToNextMonth() {
    const nextMonth = getMonthStart(addMonthsToDateKey(monthDate, 1));
    setMonthDate(nextMonth);
    setSelectedDate(nextMonth);
  }

  function goToToday() {
    setMonthDate(getMonthStart(todayDate));
    setSelectedDate(todayDate);
  }

  return (
    <>
      <TrainingCalendarPageHeader
        monthLabel={calendar.summary.monthLabel}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      <section className="mb-5 flex flex-wrap gap-2">
        <Badge tone={sourceBadge.tone}>{sourceBadge.label}</Badge>
        {dailyEntriesLoading ? <Badge>Cargando entradas diarias</Badge> : null}
        {dailyEntriesError ? <Badge tone="warning">Entradas diarias no disponibles</Badge> : null}
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

      {dailyEntriesError ? (
        <p className="mb-5 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--warning)]">
          {dailyEntriesError} El calendario se muestra con sesiones reales y movilidad a 0 cuando no haya sesiones de movilidad.
        </p>
      ) : null}

      <div className="space-y-5">
        <CalendarMonthSummary summary={calendar.summary} />

        {isLoading ? (
          <Card>
            <p className="text-lg font-semibold">Cargando calendario.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Consultando sesiones reales y preparando la vista mensual.</p>
          </Card>
        ) : calendar.summary.sessionsCount === 0 ? (
          <Card>
            <p className="text-lg font-semibold">Sin sesiones en este mes.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              El calendario queda disponible para navegar otros meses. Cuando importes entrenamientos aparecerán como días activos.
            </p>
            <Link
              href="/training/import"
              className="mt-4 inline-flex rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
            >
              Importar entrenamiento
            </Link>
          </Card>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <TrainingCalendarGrid days={calendar.days} onSelectDate={setSelectedDate} />
          <div className="space-y-5">
            <CalendarDayDetailPanel day={selectedDay} />
            <DisciplineMonthBreakdown summary={calendar.summary} />
          </div>
        </div>
      </div>
    </>
  );
}
