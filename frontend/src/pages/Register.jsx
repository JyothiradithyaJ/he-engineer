import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthVisual from '../components/AuthVisual.jsx';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', password: '', role: 'employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!PASSWORD_RULE.test(form.password)) {
      setError('Password needs at least 8 characters, including an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-mist">
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 max-w-2xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-amber text-ink font-display font-bold">D</span>
          <span className="font-display font-semibold text-lg text-ink">Dayflow</span>
        </Link>

        <h1 className="font-display font-bold text-3xl text-ink">Create an account</h1>
        <p className="text-slate-muted mt-2">Sign up and get your workweek aligned in minutes.</p>

        {error && (
          <div className="mt-6 rounded-xl bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3">{error}</div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" name="name" required className="input-field" placeholder="Amélie Laurent" value={form.name} onChange={onChange} />
            </div>
            <div>
              <label className="label" htmlFor="employeeId">Employee ID</label>
              <input id="employeeId" name="employeeId" required className="input-field" placeholder="EMP-204" value={form.employeeId} onChange={onChange} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="input-field" placeholder="amelie@company.com" value={form.email} onChange={onChange} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required className="input-field" placeholder="At least 8 characters" value={form.password} onChange={onChange} />
          </div>
          <div>
            <span className="label">I am signing up as</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: 'employee', label: 'Employee' },
                { v: 'admin', label: 'HR / Admin' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => setForm({ ...form, role: opt.v })}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    form.role === opt.v ? 'border-teal bg-teal/10 text-teal' : 'border-slate-faint/40 text-slate-muted hover:border-teal/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Submit'}
          </button>
        </form>

        <p className="text-sm text-slate-muted mt-8">
          Have any account? <Link to="/login" className="text-teal font-semibold hover:underline">Sign in</Link>
        </p>
        <p className="text-xs text-slate-faint mt-3">By continuing you agree to Dayflow's Terms &amp; Conditions.</p>
      </div>

      <AuthVisual />
    </div>
  );
}
