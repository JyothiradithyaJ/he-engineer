import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge.jsx';
import { downloadCSV } from '../utils/csv.js';

export default function Attendance() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminAttendance /> : <EmployeeAttendance />;
}

function EmployeeAttendance() {
  const [view, setView] = useState('weekly');
  const [rows, setRows] = useState([]);

  const load = async () => {
    const days = view === 'weekly' ? 7 : 30;
    const to = new Date();
    const from = new Date(); from.setDate(from.getDate() - days);
    const { data } = await api.get('/attendance/me', { params: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) } });
    setRows(data.attendance);
  };
  useEffect(() => { load(); }, [view]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Your attendance</h1>
          <p className="text-slate-muted mt-1">Daily and weekly check-in history.</p>
        </div>
        <div className="flex bg-mist rounded-full p-1">
          {['weekly', 'monthly'].map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${view === v ? 'bg-paper shadow-card text-ink' : 'text-slate-muted'}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-slate-muted text-xs uppercase tracking-wide">
            <tr><Th>Date</Th><Th>Check-in</Th><Th>Check-out</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-faint/10">
                <Td className="font-mono">{r.date}</Td>
                <Td>{r.check_in || '—'}</Td>
                <Td>{r.check_out || '—'}</Td>
                <Td><StatusBadge status={r.status} /></Td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="text-center text-slate-muted py-8">No records in this range.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminAttendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get('/attendance/all', { params: { date } });
    setRows(data.attendance);
  };
  useEffect(() => { load(); }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Attendance records</h1>
          <p className="text-slate-muted mt-1">Organization-wide, by date.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field !w-auto" />
          <button
            className="btn-secondary !py-2.5"
            onClick={() => downloadCSV(`attendance-${date}.csv`, rows, ['name', 'employee_id', 'department', 'date', 'check_in', 'check_out', 'status'])}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-slate-muted text-xs uppercase tracking-wide">
            <tr><Th>Employee</Th><Th>Department</Th><Th>Check-in</Th><Th>Check-out</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-faint/10">
                <Td className="font-medium text-ink">{r.name} <span className="text-slate-faint font-mono text-xs">({r.employee_id})</span></Td>
                <Td>{r.department}</Td>
                <Td>{r.check_in || '—'}</Td>
                <Td>{r.check_out || '—'}</Td>
                <Td><StatusBadge status={r.status} /></Td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="text-center text-slate-muted py-8">No check-ins on this date.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) { return <th className="text-left font-semibold px-5 py-3">{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3 ${className}`}>{children}</td>; }
