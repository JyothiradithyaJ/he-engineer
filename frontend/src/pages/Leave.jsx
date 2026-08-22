import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Leave() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminLeave /> : <EmployeeLeave />;
}

function EmployeeLeave() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveType: 'Paid', startDate: '', endDate: '', remarks: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await api.get('/leave/me');
    setLeaves(data.leaves);
  };
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await api.post('/leave', form);
      setForm({ leaveType: 'Paid', startDate: '', endDate: '', remarks: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Leave &amp; time-off</h1>
        <p className="text-slate-muted mt-1">Apply for leave and track its status.</p>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg text-ink">Apply for leave</h2>
        {error && <div className="rounded-xl bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3">{error}</div>}
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="label">Leave type</label>
            <select name="leaveType" value={form.leaveType} onChange={onChange} className="input-field">
              <option>Paid</option><option>Sick</option><option>Unpaid</option>
            </select>
          </div>
          <div>
            <label className="label">Start date</label>
            <input type="date" name="startDate" required value={form.startDate} onChange={onChange} className="input-field" />
          </div>
          <div>
            <label className="label">End date</label>
            <input type="date" name="endDate" required value={form.endDate} onChange={onChange} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label">Remarks (optional)</label>
          <textarea name="remarks" value={form.remarks} onChange={onChange} rows={2} className="input-field" placeholder="Anything HR should know" />
        </div>
        <button disabled={submitting} className="btn-primary">{submitting ? 'Submitting…' : 'Submit request'}</button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-slate-muted text-xs uppercase tracking-wide">
            <tr><Th>Type</Th><Th>Dates</Th><Th>Remarks</Th><Th>Status</Th><Th>HR comment</Th></tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-t border-slate-faint/10">
                <Td>{l.leave_type}</Td>
                <Td className="font-mono">{l.start_date} → {l.end_date}</Td>
                <Td className="text-slate-muted">{l.remarks || '—'}</Td>
                <Td><StatusBadge status={l.status} /></Td>
                <Td className="text-slate-muted">{l.admin_comment || '—'}</Td>
              </tr>
            ))}
            {leaves.length === 0 && <tr><td colSpan={5} className="text-center text-slate-muted py-8">No leave requests yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminLeave() {
  const [status, setStatus] = useState('Pending');
  const [leaves, setLeaves] = useState([]);
  const [comments, setComments] = useState({});

  const load = async () => {
    const { data } = await api.get('/leave', { params: status === 'All' ? {} : { status } });
    setLeaves(data.leaves);
  };
  useEffect(() => { load(); }, [status]);

  const act = async (id, newStatus) => {
    await api.patch(`/leave/${id}`, { status: newStatus, adminComment: comments[id] || '' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Leave approvals</h1>
          <p className="text-slate-muted mt-1">Review, approve or reject employee requests.</p>
        </div>
        <div className="flex bg-mist rounded-full p-1">
          {['Pending', 'Approved', 'Rejected', 'All'].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${status === s ? 'bg-paper shadow-card text-ink' : 'text-slate-muted'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {leaves.map((l) => (
          <div key={l.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="font-display font-semibold text-ink">{l.name} <span className="text-slate-faint font-mono text-xs">({l.employee_id})</span></p>
              <p className="text-sm text-slate-muted">{l.leave_type} · {l.start_date} → {l.end_date}</p>
              {l.remarks && <p className="text-sm text-slate-muted mt-1">"{l.remarks}"</p>}
              <StatusBadge status={l.status} />
            </div>
            {l.status === 'Pending' ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  placeholder="Comment (optional)"
                  className="input-field !py-2 text-sm sm:w-48"
                  onChange={(e) => setComments({ ...comments, [l.id]: e.target.value })}
                />
                <div className="flex gap-2">
                  <button onClick={() => act(l.id, 'Approved')} className="btn-primary !py-2 !px-4 text-sm">Approve</button>
                  <button onClick={() => act(l.id, 'Rejected')} className="btn-secondary !py-2 !px-4 text-sm">Reject</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-muted">{l.admin_comment || 'No comment left.'}</p>
            )}
          </div>
        ))}
        {leaves.length === 0 && <p className="text-center text-slate-muted py-10">No requests here.</p>}
      </div>
    </div>
  );
}

function Th({ children }) { return <th className="text-left font-semibold px-5 py-3">{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3 ${className}`}>{children}</td>; }
