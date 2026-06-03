export function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-md border border-[rgba(244,247,244,0.06)] bg-[linear-gradient(90deg,rgba(244,247,244,0.045),rgba(244,247,244,0.08),rgba(244,247,244,0.045))] ${className}`}
    />
  );
}

export function SkeletonText({
  lines = 3,
}: {
  lines?: number;
}) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
