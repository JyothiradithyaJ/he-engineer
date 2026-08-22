import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function DashboardAdmin() {
  const [overview, setOverview] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    api.get('/analytics/overview').then(({ data }) => setOverview(data));
    api.get('/attendance/all').then(({ data }) => setTodayAttendance(data.attendance));
    api.get('/leave', { params: { status: 'Pending' } }).then(({ data }) => setPendingLeaves(data.leaves));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Team overview</h1>
        <p className="text-slate-muted mt-1">Everything that needs your attention today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total employees" value={overview?.totalEmployees ?? '—'} accent="teal" />
        <StatCard label="Present today" value={overview?.presentToday ?? '—'} accent="moss" />
        <StatCard label="Pending leave requests" value={overview?.pendingLeaves ?? '—'} accent="amber" sub={pendingLeaves.length ? 'Needs review' : undefined} />
        <StatCard label="Payroll this month" value={`$${Math.round(overview?.payrollTotalThisMonth ?? 0).toLocaleString()}`} accent="teal" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-ink">Today's attendance</h2>
            <Link to="/app/attendance" className="text-sm text-teal font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {todayAttendance.slice(0, 7).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-faint/10 last:border-0">
                <span className="text-ink font-medium">{a.name}</span>
                <span className="font-mono text-slate-muted">{a.check_in || '—'} → {a.check_out || '—'}</span>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {todayAttendance.length === 0 && <p className="text-sm text-slate-muted">No check-ins recorded yet today.</p>}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-ink">Pending leave approvals</h2>
            <Link to="/app/leave" className="text-sm text-teal font-semibold hover:underline">Review all</Link>
          </div>
          <div className="space-y-2">
            {pendingLeaves.slice(0, 7).map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-faint/10 last:border-0">
                <span className="text-ink font-medium">{l.name}</span>
                <span className="text-slate-muted">{l.leave_type}</span>
                <span className="font-mono text-slate-muted">{l.start_date} → {l.end_date}</span>
              </div>
            ))}
            {pendingLeaves.length === 0 && <p className="text-sm text-slate-muted">Nothing pending — nice and clear.</p>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-ink">Headcount by department</h2>
          <Link to="/app/analytics" className="text-sm text-teal font-semibold hover:underline">Full analytics</Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {overview?.byDepartment?.map((d) => (
            <div key={d.department} className="rounded-xl bg-mist px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-ink font-medium">{d.department}</span>
              <span className="font-display font-semibold text-teal">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
