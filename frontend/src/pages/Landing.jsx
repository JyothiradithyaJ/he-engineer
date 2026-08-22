import { Link } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_STATE = ['off', 'in', 'in', 'in', 'leave', 'in', 'off']; // for the signature flow visual

function WeekFlow() {
  // Signature element: a single continuous line that threads through every day of the week,
  // pausing at a filled dot for a workday, an open ring for a day off, and a dashed ring for leave.
  const points = DAYS.map((_, i) => ({ x: 40 + i * 100, y: 90 + Math.sin(i * 0.9) * 26 }));
  const path = points.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');

  return (
    <svg viewBox="0 0 720 200" className="w-full h-auto" role="img" aria-label="Weekly attendance flow illustration">
      <path d={path} fill="none" stroke="rgba(244,251,250,0.18)" strokeWidth="3" />
      <path d={path} fill="none" stroke="#F5B500" strokeWidth="3" strokeDasharray="10 10" className="animate-flow" />
      {points.map((p, i) => {
        const state = DAY_STATE[i];
        return (
          <g key={i}>
            {state === 'in' && <circle cx={p.x} cy={p.y} r="9" fill="#F5B500" />}
            {state === 'off' && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="rgba(244,251,250,0.5)" strokeWidth="2.5" />}
            {state === 'leave' && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#56C2C0" strokeWidth="2.5" strokeDasharray="3 3" />}
            <text x={p.x} y={p.y + 34} textAnchor="middle" className="fill-mist/70 font-mono" fontSize="13">{DAYS[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function NavBar() {
  return (
    <header className="relative z-20 max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-6">
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-amber text-ink font-display font-bold">D</span>
        <span className="font-display font-semibold text-lg text-mist">Dayflow</span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm text-mist/75 font-medium">
        <a href="#flow" className="hover:text-mist transition-colors">How it flows</a>
        <a href="#features" className="hover:text-mist transition-colors">Features</a>
        <a href="#chatbot" className="hover:text-mist transition-colors">Assistant</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm font-semibold text-mist/85 hover:text-mist transition-colors">Sign in</Link>
        <Link to="/register" className="btn-primary !py-2.5 !px-5 text-sm">Start free trial</Link>
      </div>
    </header>
  );
}

const STEPS = [
  { n: '01', title: 'Onboard', body: 'New hires register with an employee ID and verified email, then land straight on a role-aware dashboard.' },
  { n: '02', title: 'Show up', body: 'One-tap check-in and check-out fills the daily and weekly attendance view automatically — no spreadsheets.' },
  { n: '03', title: 'Request time off', body: 'Paid, sick or unpaid leave requests route to HR instantly, with status tracked from pending to resolved.' },
  { n: '04', title: 'Get paid', body: 'Payroll stays read-only and transparent for employees, fully editable for HR — no surprises either side.' },
  { n: '05', title: 'Ask Dayflow', body: 'A Groq-powered assistant answers "how many leave days do I have left" in seconds, in plain language.' },
];

const FEATURES = [
  { title: 'Role-based dashboards', body: 'Employees see their own day; HR sees the whole org — attendance, approvals and payroll in one screen.' },
  { title: 'Live approval queue', body: 'Every leave request lands in one queue with one-click approve or reject and automatic notifications.' },
  { title: 'Workforce analytics', body: 'Headcount by department, attendance trends and leave patterns, charted without a spreadsheet export.' },
  { title: 'Groq-powered assistant', body: 'A fast, context-aware chatbot that knows each employee\'s own attendance, leave and role — nothing more.' },
];

export default function Landing() {
  return (
    <div className="bg-mist">
      {/* Hero */}
      <section className="relative overflow-hidden bg-flow-gradient">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <NavBar />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-6 pb-20 md:pt-10 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-teal-light bg-mist/5 border border-mist/15 rounded-full px-3 py-1.5">
              HR Management System
            </span>
            <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] text-mist mt-6">
              Every workday,<br />perfectly aligned.
            </h1>
            <p className="text-mist/75 text-lg mt-6 max-w-md">
              Dayflow threads onboarding, attendance, leave and payroll into a single, calm line —
              so HR spends less time reconciling and more time deciding.
            </p>
            <div className="flex flex-wrap gap-4 mt-9">
              <Link to="/register" className="btn-primary">Start free trial</Link>
              <Link to="/login" className="btn-secondary !border-mist/25 !text-mist hover:!border-amber hover:!text-amber">Sign in</Link>
            </div>
            <p className="text-mist/50 text-sm mt-6 font-mono">No credit card · demo login provided</p>
          </div>
          <div className="relative">
            <div className="card !bg-ink-2/60 !border-mist/10 backdrop-blur p-6 md:p-8 animate-floatSlow">
              <p className="text-mist/60 text-xs font-mono uppercase tracking-widest mb-2">This week</p>
              <WeekFlow />
              <div className="flex items-center gap-5 mt-2 text-xs text-mist/60 font-mono">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber inline-block" /> Present</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-mist/50 inline-block" /> Off</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-teal-light border-dashed inline-block" /> Leave</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it flows */}
      <section id="flow" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <p className="text-teal font-mono text-xs uppercase tracking-widest mb-3">How it flows</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-ink max-w-xl">From first login to payslip — five steps, one straight line.</h2>
        <div className="mt-14 grid md:grid-cols-5 gap-x-6 gap-y-10">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative pl-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-sm text-teal font-semibold">{s.n}</span>
                <span className="h-px flex-1 bg-slate-faint/30" />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink">{s.title}</h3>
              <p className="text-sm text-slate-muted mt-2 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-ink-2">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
          <p className="text-teal-light font-mono text-xs uppercase tracking-widest mb-3">Built for HR &amp; every employee</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-mist max-w-xl">Everything the requirements ask for, nothing you have to bolt on.</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-14">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-mist/10 bg-ink/40 p-7">
                <h3 className="font-display font-semibold text-xl text-mist">{f.title}</h3>
                <p className="text-mist/65 mt-2.5 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assistant teaser */}
      <section id="chatbot" className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-teal font-mono text-xs uppercase tracking-widest mb-3">Dayflow Assistant</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink">Ask it like you'd ask HR.</h2>
          <p className="text-slate-muted mt-4 leading-relaxed max-w-md">
            Powered by Groq for near-instant responses, the assistant already knows the signed-in
            employee's recent attendance and leave status — so answers are specific, not generic.
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-faint/20">
            <span className="h-2 w-2 rounded-full bg-moss" />
            <span className="text-xs font-mono text-slate-muted">Dayflow Assistant</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="bg-mist rounded-xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">How many paid leave days have I used this year?</div>
            <div className="bg-teal/10 rounded-xl rounded-tr-sm px-4 py-2.5 max-w-[85%] ml-auto text-ink">You've used 3 paid leave days, with 1 request still pending approval. Want me to point you to the Leave tab?</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-flow-gradient">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-24 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-mist">Bring your team's workweek into one flow.</h2>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/register" className="btn-primary">Create your account</Link>
            <Link to="/login" className="btn-secondary !border-mist/25 !text-mist hover:!border-amber hover:!text-amber">I already have one</Link>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-muted">
        <span>© {new Date().getFullYear()} Dayflow. Built for the HRMS hackathon brief.</span>
        <span className="font-mono text-xs">Demo: admin@dayflow.dev / employee@dayflow.dev — password Password123</span>
      </footer>
    </div>
  );
}
