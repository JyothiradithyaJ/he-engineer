import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ phone: user?.phone || '', address: user?.address || '', profile_pic: user?.profile_pic || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const { data } = await api.patch(`/employees/${user.id}`, form);
      refreshUser(data.user);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Your profile</h1>
        <p className="text-slate-muted mt-1">Personal details, job info and salary structure.</p>
      </div>

      <div className="card p-6 flex items-center gap-5">
        <span className="h-16 w-16 rounded-full bg-teal/15 text-teal font-display font-bold text-2xl grid place-items-center overflow-hidden">
          {form.profile_pic ? <img src={form.profile_pic} alt="" className="h-full w-full object-cover" /> : user?.name?.[0]}
        </span>
        <div>
          <p className="font-display font-semibold text-xl text-ink">{user?.name}</p>
          <p className="text-slate-muted text-sm">{user?.designation} · {user?.department}</p>
          <p className="text-slate-faint text-xs font-mono mt-1">{user?.employee_id}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Job details</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Email" value={user?.email} />
            <Row label="Department" value={user?.department} />
            <Row label="Designation" value={user?.designation} />
            <Row label="Joined" value={user?.join_date} />
            <Row label="Role" value={user?.role === 'admin' ? 'HR / Admin' : 'Employee'} />
          </dl>
        </div>
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Salary structure</h2>
          <p className="text-xs text-slate-muted mb-3">Read-only. Contact HR for changes.</p>
          <p className="font-display font-bold text-3xl text-ink">${Number(user?.base_salary || 0).toLocaleString()}<span className="text-sm font-body text-slate-muted font-normal">/yr base</span></p>
        </div>
      </div>

      <form onSubmit={save} className="card p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg text-ink">Edit contact details</h2>
        {error && <div className="rounded-xl bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3">{error}</div>}
        {saved && <div className="rounded-xl bg-moss/10 border border-moss/30 text-moss text-sm px-4 py-3">Saved.</div>}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Phone</label>
            <input name="phone" className="input-field" value={form.phone} onChange={onChange} />
          </div>
          <div>
            <label className="label">Profile picture URL</label>
            <input name="profile_pic" className="input-field" placeholder="https://…" value={form.profile_pic} onChange={onChange} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input name="address" className="input-field" value={form.address} onChange={onChange} />
        </div>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-muted">{label}</dt>
      <dd className="text-ink font-medium">{value || '—'}</dd>
    </div>
  );
}
