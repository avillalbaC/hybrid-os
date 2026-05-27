export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 max-w-4xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-5xl">{title}</h2>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
