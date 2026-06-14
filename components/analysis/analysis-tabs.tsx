"use client";

export type AnalysisTab = "current" | "weeks" | "months" | "trends" | "data-quality";

const tabs: Array<{ id: AnalysisTab; label: string }> = [
  { id: "current", label: "Actual" },
  { id: "weeks", label: "Semanas" },
  { id: "months", label: "Meses" },
  { id: "trends", label: "Tendencias" },
  { id: "data-quality", label: "Calidad de datos" },
];

export function AnalysisTabs({
  activeTab,
  onChange,
}: {
  activeTab: AnalysisTab;
  onChange: (tab: AnalysisTab) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:overflow-x-auto sm:pb-1" role="tablist" aria-label="Secciones de análisis">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={`min-h-11 rounded-md border px-3 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:shrink-0 sm:px-4 ${
            activeTab === tab.id
              ? "border-[var(--accent-border)] bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--foreground)] hover:border-[var(--accent-border)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
