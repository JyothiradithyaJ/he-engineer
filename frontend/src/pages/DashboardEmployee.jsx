import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function DashboardEmployee() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = attendance.find((a) => a.date === today);

  const load = async () => {
    const [a, l] = await Promise.all([api.get('/attendance/me'), api.get('/leave/me')]);
    setAttendance(a.data.attendance);
    setLeaves(l.data.leaves);
  };

  useEffect(() => { load(); }, []);

  const doCheckIn = async () => {
    setBusy(true); setError('');
    try { await api.post('/attendance/check-in'); await load(); }
    catch (e) { setError(e.response?.data?.error || 'Could not check in.'); }
    finally { setBusy(false); }
  };
  const doCheckOut = async () => {
    setBusy(true); setError('');
    try { await api.post('/attendance/check-out'); await load(); }
    catch (e) { setError(e.response?.data?.error || 'Could not check out.'); }
    finally { setBusy(false); }
  };

  const presentDays = attendance.filter((a) => a.status === 'Present').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
  const usedLeaveDays = leaves.filter((l) => l.status === 'Approved').reduce((sum, l) => {
    const days = (new Date(l.end_date) - new Date(l.start_date)) / 86400000 + 1;
    return sum + days;
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Hi {user?.name?.split(' ')[0]}, here's your day.</h1>
        <p className="text-slate-muted mt-1">{user?.designation} · {user?.department}</p>
      </div>

      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted">Today</p>
          <p className="font-display text-xl text-ink mt-1">
            {todayRecord?.check_in ? `Checked in at ${todayRecord.check_in}` : 'Not checked in yet'}
            {todayRecord?.check_out && ` · out at ${todayRecord.check_out}`}
          </p>
          {error && <p className="text-coral text-sm mt-2">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={doCheckIn} disabled={busy || todayRecord?.check_in} className="btn-primary">Check in</button>
          <button onClick={doCheckOut} disabled={busy || !todayRecord?.check_in || todayRecord?.check_out} className="btn-secondary">Check out</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard label="Present days (last 30)" value={presentDays} accent="moss" />
        <StatCard label="Leave days used" value={usedLeaveDays} accent="teal" />
        <StatCard label="Pending requests" value={pendingLeaves} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-ink">Recent attendance</h2>
            <Link to="/app/attendance" className="text-sm text-teal font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {attendance.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-faint/10 last:border-0">
                <span className="font-mono text-slate-muted">{a.date}</span>
                <span className="text-ink">{a.check_in || '—'} → {a.check_out || '—'}</span>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {attendance.length === 0 && <p className="text-sm text-slate-muted">No attendance recorded yet.</p>}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-ink">Leave requests</h2>
            <Link to="/app/leave" className="text-sm text-teal font-semibold hover:underline">Apply / view all</Link>
          </div>
          <div className="space-y-2">
            {leaves.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-faint/10 last:border-0">
                <span className="text-ink">{l.leave_type}</span>
                <span className="font-mono text-slate-muted">{l.start_date} → {l.end_date}</span>
                <StatusBadge status={l.status} />
              </div>
            ))}
            {leaves.length === 0 && <p className="text-sm text-slate-muted">No leave requests yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
