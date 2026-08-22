import { useEffect, useState } from 'react';
import api from '../api/client';
import { downloadCSV } from '../utils/csv.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await api.get('/employees', { params: { search, department } });
    setEmployees(data.employees);
  };

  useEffect(() => { api.get('/employees/departments').then(({ data }) => setDepartments(data.departments)); }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search, department]);

  const openEdit = (emp) => {
    setEditing(emp.id);
    setForm({ name: emp.name, department: emp.department, designation: emp.designation, phone: emp.phone, address: emp.address, base_salary: emp.base_salary, role: emp.role });
  };

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.patch(`/employees/${editing}`, { ...form, base_salary: Number(form.base_salary) });
    setEmployees((es) => es.map((e) => (e.id === editing ? data.user : e)));
    setMsg('Employee updated.');
    setEditing(null);
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Employees</h1>
          <p className="text-slate-muted mt-1">{employees.length} people across the organization.</p>
        </div>
        <button className="btn-secondary" onClick={() => downloadCSV('employees.csv', employees, ['employee_id', 'name', 'email', 'department', 'designation', 'role', 'base_salary'])}>
          Export CSV
        </button>
      </div>

      {msg && <div className="rounded-xl bg-moss/10 border border-moss/30 text-moss text-sm px-4 py-3">{msg}</div>}

      <div className="flex flex-wrap gap-3">
        <input placeholder="Search by name, email or ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field sm:w-72" />
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field !w-auto">
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-slate-muted text-xs uppercase tracking-wide">
            <tr><Th>Name</Th><Th>Department</Th><Th>Designation</Th><Th>Role</Th><Th>Base salary</Th><Th /></tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t border-slate-faint/10">
                <Td className="font-medium text-ink">{e.name} <span className="text-slate-faint font-mono text-xs">({e.employee_id})</span></Td>
                <Td>{e.department}</Td>
                <Td>{e.designation}</Td>
                <Td className="capitalize">{e.role}</Td>
                <Td>${Number(e.base_salary).toLocaleString()}</Td>
                <Td><button onClick={() => openEdit(e)} className="text-teal font-semibold hover:underline">Edit</button></Td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan={6} className="text-center text-slate-muted py-8">No employees match.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} className="card p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-semibold text-lg text-ink">Edit employee</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name"><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Role">
                <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="employee">Employee</option><option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Department"><input className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
              <Field label="Designation"><input className="input-field" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
              <Field label="Phone"><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Base salary"><input type="number" className="input-field" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} /></Field>
            </div>
            <Field label="Address"><input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              <button className="btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) { return <div><label className="label">{label}</label>{children}</div>; }
function Th({ children }) { return <th className="text-left font-semibold px-5 py-3">{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3 ${className}`}>{children}</td>; }
