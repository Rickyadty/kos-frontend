export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-jet tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
