const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AuthVisual() {
  const todayIdx = new Date().getDay();
  const dates = DAYS.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - todayIdx + i);
    return d.getDate();
  });

  return (
    <div className="relative hidden lg:flex flex-1 bg-flow-gradient overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 m-auto max-w-md w-full px-8">
        <div className="rounded-2xl bg-ink-2/70 border border-mist/10 backdrop-blur p-5 shadow-soft animate-floatSlow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-mist font-display font-semibold text-sm">Leave request</p>
              <p className="text-mist/50 text-xs font-mono">Pending your review</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-amber" />
          </div>
          <p className="text-mist/80 text-sm">Noah Kim requested 2 days of Sick leave, Aug 24–25.</p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs font-semibold rounded-full bg-moss/20 text-moss px-3 py-1.5">Approve</span>
            <span className="text-xs font-semibold rounded-full bg-mist/10 text-mist/70 px-3 py-1.5">Review</span>
          </div>
        </div>

        <div className="rounded-2xl bg-mist p-5 shadow-soft mt-5 -translate-x-4">
          <div className="flex justify-between text-center">
            {DAYS.map((d, i) => (
              <div key={d} className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-1.5 ${i === todayIdx ? 'bg-amber/15' : ''}`}>
                <span className="text-[10px] font-mono text-slate-muted">{d}</span>
                <span className={`text-sm font-display font-semibold ${i === todayIdx ? 'text-amber-deep' : 'text-ink'}`}>{dates[i]}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-faint/20 mt-4 pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-display font-semibold text-ink">Daily check-in</p>
              <p className="text-xs text-slate-muted font-mono">09:02 AM · on time</p>
            </div>
            <div className="flex -space-x-2">
              {['bg-teal', 'bg-amber', 'bg-moss'].map((c, i) => (
                <span key={i} className={`h-7 w-7 rounded-full ${c} border-2 border-mist`} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-mist/50 text-sm mt-8 text-center font-body">
          "Dayflow took our onboarding-to-payroll chaos and gave it one clean line to follow."
        </p>
      </div>
    </div>
  );
}
