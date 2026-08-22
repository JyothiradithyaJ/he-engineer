import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import { downloadCSV } from '../utils/csv.js';

export default function Payroll() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminPayroll /> : <EmployeePayroll />;
}

function EmployeePayroll() {
  const [data, setData] = useState({ payslips: [], baseSalary: 0 });
  useEffect(() => { api.get('/payroll/me').then(({ data }) => setData(data)); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Payroll</h1>
        <p className="text-slate-muted mt-1">Read-only — reach out to HR for changes.</p>
      </div>
      <div className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted">Annual base salary</p>
        <p className="font-display font-bold text-3xl text-ink mt-2">${Number(data.baseSalary).toLocaleString()}</p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-slate-muted text-xs uppercase tracking-wide">
            <tr><Th>Month</Th><Th>Basic</Th><Th>HRA</Th><Th>Allowances</Th><Th>Deductions</Th><Th>Net pay</Th></tr>
          </thead>
          <tbody>
            {data.payslips.map((p) => (
              <tr key={p.id} className="border-t border-slate-faint/10">
                <Td className="font-mono">{p.month}</Td>
                <Td>${p.basic.toLocaleString()}</Td>
                <Td>${p.hra.toLocaleString()}</Td>
                <Td>${p.allowances.toLocaleString()}</Td>
                <Td>${p.deductions.toLocaleString()}</Td>
                <Td className="font-semibold text-ink">${p.net_pay.toLocaleString()}</Td>
              </tr>
            ))}
            {data.payslips.length === 0 && <tr><td colSpan={6} className="text-center text-slate-muted py-8">No payslips generated yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPayroll() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState('');
  const [payslips, setPayslips] = useState([]);
  const [baseSalary, setBaseSalary] = useState('');
  const [form, setForm] = useState({ month: new Date().toISOString().slice(0, 7), basic: '', hra: '', allowances: '', deductions: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get('/employees').then(({ data }) => setEmployees(data.employees)); }, []);

  useEffect(() => {
    if (!selected) return;
    const emp = employees.find((e) => e.id === selected);
    setBaseSalary(emp?.base_salary || 0);
    api.get(`/payroll/employee/${selected}`).then(({ data }) => setPayslips(data.payslips));
  }, [selected]);

  const saveBase = async () => {
    await api.patch(`/payroll/employee/${selected}/base-salary`, { baseSalary: Number(baseSalary) });
    setMsg('Base salary updated.');
    setTimeout(() => setMsg(''), 2500);
  };

  const generate = async (e) => {
    e.preventDefault();
    const { data } = await api.post(`/payroll/employee/${selected}`, {
      month: form.month,
      basic: Number(form.basic),
      hra: Number(form.hra || 0),
      allowances: Number(form.allowances || 0),
      deductions: Number(form.deductions || 0),
    });
    setPayslips((p) => [data.payslip, ...p.filter((x) => x.month !== data.payslip.month)]);
    setMsg('Payslip generated and the employee has been notified.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Payroll control</h1>
          <p className="text-slate-muted mt-1">Manage salary structure and generate payslips.</p>
        </div>
        {payslips.length > 0 && (
          <button className="btn-secondary" onClick={() => downloadCSV(`payroll-${selected}.csv`, payslips, ['month', 'basic', 'hra', 'allowances', 'deductions', 'net_pay'])}>
            Export CSV
          </button>
        )}
      </div>

      <div className="card p-6">
        <label className="label">Select employee</label>
        <select className="input-field sm:w-96" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Choose an employee…</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>)}
        </select>
      </div>

      {selected && (
        <>
          {msg && <div className="rounded-xl bg-moss/10 border border-moss/30 text-moss text-sm px-4 py-3">{msg}</div>}

          <div className="card p-6 flex flex-wrap items-end gap-4">
            <div>
              <label className="label">Annual base salary</label>
              <input type="number" className="input-field !w-48" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
            </div>
            <button onClick={saveBase} className="btn-secondary">Update base salary</button>
          </div>

          <form onSubmit={generate} className="card p-6 space-y-5">
            <h2 className="font-display font-semibold text-lg text-ink">Generate / update payslip</h2>
            <div className="grid sm:grid-cols-5 gap-4">
              <Field label="Month"><input type="month" required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="input-field" /></Field>
              <Field label="Basic"><input type="number" required value={form.basic} onChange={(e) => setForm({ ...form, basic: e.target.value })} className="input-field" /></Field>
              <Field label="HRA"><input type="number" value={form.hra} onChange={(e) => setForm({ ...form, hra: e.target.value })} className="input-field" /></Field>
              <Field label="Allowances"><input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} className="input-field" /></Field>
              <Field label="Deductions"><input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className="input-field" /></Field>
            </div>
            <button className="btn-primary">Generate payslip</button>
          </form>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-mist text-slate-muted text-xs uppercase tracking-wide">
                <tr><Th>Month</Th><Th>Basic</Th><Th>HRA</Th><Th>Allowances</Th><Th>Deductions</Th><Th>Net pay</Th></tr>
              </thead>
              <tbody>
                {payslips.map((p) => (
                  <tr key={p.id} className="border-t border-slate-faint/10">
                    <Td className="font-mono">{p.month}</Td>
                    <Td>${p.basic.toLocaleString()}</Td>
                    <Td>${p.hra.toLocaleString()}</Td>
                    <Td>${p.allowances.toLocaleString()}</Td>
                    <Td>${p.deductions.toLocaleString()}</Td>
                    <Td className="font-semibold text-ink">${p.net_pay.toLocaleString()}</Td>
                  </tr>
                ))}
                {payslips.length === 0 && <tr><td colSpan={6} className="text-center text-slate-muted py-8">No payslips yet for this employee.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children }) { return <div><label className="label">{label}</label>{children}</div>; }
function Th({ children }) { return <th className="text-left font-semibold px-5 py-3">{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3 ${className}`}>{children}</td>; }
