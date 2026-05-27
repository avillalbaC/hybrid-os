export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.26)] ${className}`}>
      {children}
    </section>
  );
}
