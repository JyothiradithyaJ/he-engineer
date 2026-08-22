const STYLES = {
  Present: 'bg-moss/10 text-moss',
  Approved: 'bg-moss/10 text-moss',
  'Half-day': 'bg-amber/15 text-amber-deep',
  Pending: 'bg-amber/15 text-amber-deep',
  Absent: 'bg-coral/10 text-coral',
  Rejected: 'bg-coral/10 text-coral',
  Leave: 'bg-teal/10 text-teal',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STYLES[status] || 'bg-slate-faint/20 text-slate-muted'}`}>
      {status}
    </span>
  );
}
