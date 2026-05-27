"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { TrainingSession } from "@/types/training";

export type DashboardDataSource = "loading" | "remote" | "seed-fallback";

type DashboardDataResponse = {
  sessions?: TrainingSession[];
  bodyChecks?: BodyCheck[];
  nutritionChecks?: NutritionCheck[];
};

function hasAnyRemoteData(data: DashboardDataResponse) {
  return Boolean(
    data.sessions?.length ||
      data.bodyChecks?.length ||
      data.nutritionChecks?.length,
  );
}

export function useDashboardData({
  seedSessions,
  seedBodyChecks,
  seedNutritionChecks,
}: {
  seedSessions: TrainingSession[];
  seedBodyChecks: BodyCheck[];
  seedNutritionChecks: NutritionCheck[];
}) {
  const [remoteData, setRemoteData] = useState<DashboardDataResponse | null>(null);
  const [source, setSource] = useState<DashboardDataSource>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard-data", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Dashboard data request failed.");
      }

      const payload = (await response.json()) as DashboardDataResponse;

      if (!hasAnyRemoteData(payload)) {
        setRemoteData(null);
        setSource("seed-fallback");
        setMessage("Supabase no tiene registros todavía. Mostrando seed histórico como fallback.");
        return;
      }

      setRemoteData({
        sessions: Array.isArray(payload.sessions) ? payload.sessions : [],
        bodyChecks: Array.isArray(payload.bodyChecks) ? payload.bodyChecks : [],
        nutritionChecks: Array.isArray(payload.nutritionChecks) ? payload.nutritionChecks : [],
      });
      setSource("remote");
      setMessage(null);
    } catch {
      setRemoteData(null);
      setSource("seed-fallback");
      setMessage("No se pudo cargar Supabase. Mostrando seed histórico como fallback.");
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();

    window.addEventListener("hybrid-os:remote-training-sessions-updated", loadDashboardData);

    return () => {
      window.removeEventListener("hybrid-os:remote-training-sessions-updated", loadDashboardData);
    };
  }, [loadDashboardData]);

  return useMemo(() => {
    if (source === "remote" && remoteData) {
      return {
        sessions: remoteData.sessions ?? [],
        bodyChecks: remoteData.bodyChecks ?? [],
        nutritionChecks: remoteData.nutritionChecks ?? [],
        source,
        message,
        refresh: loadDashboardData,
      };
    }

    if (source === "loading") {
      return {
        sessions: [],
        bodyChecks: [],
        nutritionChecks: [],
        source,
        message,
        refresh: loadDashboardData,
      };
    }

    return {
      sessions: seedSessions,
      bodyChecks: seedBodyChecks,
      nutritionChecks: seedNutritionChecks,
      source,
      message,
      refresh: loadDashboardData,
    };
  }, [loadDashboardData, message, remoteData, seedBodyChecks, seedNutritionChecks, seedSessions, source]);
}
