// SectionHeader — standardised section header used inside pages and panels.
//
// Replaces the inline patterns previously scattered across DigestPage,
// UseCaseLibrary, EngagementDetail, and artifact builders.
//
// Two sizes:
//   size="lg"  (default) — h2-equivalent: "Forms & Templates" with optional
//                          count chip on the left and action node on the right
//   size="sm"            — uppercase tracking-widest "section label" used inside
//                          cards/panels (replaces raw bh-section-label markup)
//
// Props:
//   title      string | node              — main heading
//   icon       node                       — optional emoji/icon before the title
//   count      number                     — optional count chip beside the title
//   action     node                       — optional right-aligned content
//                                            (link, button, or any element)
//   tone       'default' | 'danger'       — affects title and count chip colours
//   size       'lg' | 'sm'                — see above
//   className  string                     — extra utility classes for the
//                                            container (margin overrides etc.)
//
// Examples:
//   <SectionHeader title="Forms & Templates" action={<Link to="…">Output Center →</Link>} />
//   <SectionHeader icon="⚠️" title="Stale Engagements" count={3} />
//   <SectionHeader title="Open Risks" count={5} tone="danger" />
//   <SectionHeader size="sm" title="Document Detail" />

export function SectionHeader({
  title,
  icon,
  count,
  action,
  tone      = 'default',
  size      = 'lg',
  className = '',
}) {
  const isDanger = tone === 'danger';

  if (size === 'sm') {
    return (
      <div className={`flex items-center justify-between gap-2 mb-2 ${className}`}>
        <p className="bh-section-label">
          {icon && <span aria-hidden className="mr-1">{icon}</span>}
          {title}
        </p>
        {action}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-3 mb-3 ${className}`}>
      <h2 className={`flex items-center gap-2 text-lg font-semibold leading-tight ${
        isDanger ? 'text-red-800' : 'text-slate-800'
      }`}>
        {icon && <span aria-hidden>{icon}</span>}
        <span>{title}</span>
        {count != null && (
          <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
            isDanger
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {count}
          </span>
        )}
      </h2>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
