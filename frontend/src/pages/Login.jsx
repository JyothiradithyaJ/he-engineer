import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthVisual from '../components/AuthVisual.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setForm({ email: role === 'admin' ? 'admin@dayflow.dev' : 'employee@dayflow.dev', password: 'Password123' });
  };

  return (
    <div className="min-h-screen flex bg-mist">
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 max-w-2xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 mb-14">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-amber text-ink font-display font-bold">D</span>
          <span className="font-display font-semibold text-lg text-ink">Dayflow</span>
        </Link>

        <h1 className="font-display font-bold text-3xl text-ink">Welcome back</h1>
        <p className="text-slate-muted mt-2">Sign in to pick up right where your day left off.</p>

        {error && (
          <div className="mt-6 rounded-xl bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3">{error}</div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="input-field" placeholder="you@company.com" value={form.email} onChange={onChange} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required className="input-field" placeholder="••••••••" value={form.password} onChange={onChange} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-muted font-mono">
          <span>Try a demo account:</span>
          <button onClick={() => fillDemo('admin')} className="underline hover:text-teal">HR admin</button>
          <span>·</span>
          <button onClick={() => fillDemo('employee')} className="underline hover:text-teal">Employee</button>
        </div>

        <p className="text-sm text-slate-muted mt-10">
          New to Dayflow? <Link to="/register" className="text-teal font-semibold hover:underline">Create an account</Link>
        </p>
      </div>

      <AuthVisual />
    </div>
  );
}
