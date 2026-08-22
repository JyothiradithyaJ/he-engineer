export default function StatCard({ label, value, sub, accent = 'teal' }) {
  const accents = {
    teal: 'text-teal bg-teal/10',
    amber: 'text-amber-deep bg-amber/15',
    moss: 'text-moss bg-moss/10',
    coral: 'text-coral bg-coral/10',
  };
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted">{label}</p>
      <p className="font-display font-bold text-3xl text-ink mt-2">{value}</p>
      {sub && <span className={`inline-block text-xs font-mono font-medium mt-3 px-2.5 py-1 rounded-full ${accents[accent]}`}>{sub}</span>}
    </div>
  );
}
