export type ChartTone = "accent" | "secondary" | "warning" | "danger" | "neutral";

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function getChartToneClass(tone: ChartTone = "accent") {
  return {
    accent: "bg-[linear-gradient(180deg,var(--accent),var(--accent-strong))]",
    secondary: "bg-[linear-gradient(180deg,var(--accent-secondary),var(--accent-secondary-text))]",
    warning: "bg-[linear-gradient(180deg,var(--warning),rgba(240,196,107,0.55))]",
    danger: "bg-[linear-gradient(180deg,#ff8a8a,rgba(255,110,110,0.5))]",
    neutral: "bg-[linear-gradient(180deg,rgba(244,247,244,0.48),rgba(244,247,244,0.16))]",
  }[tone];
}

export function getMaxValue(values: number[]) {
  return Math.max(...values.filter(Number.isFinite), 1);
}

export function getPointPath(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return "";
  }

  const max = getMaxValue(values);
  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = values.length > 1 ? index * step : width / 2;
      const y = height - (Math.max(0, value) / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
}

export function hasChartData(values: number[]) {
  return values.some((value) => value > 0);
}
