import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Shell from './components/Shell.jsx';
import DashboardEmployee from './pages/DashboardEmployee.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import Profile from './pages/Profile.jsx';
import Attendance from './pages/Attendance.jsx';
import Leave from './pages/Leave.jsx';
import Payroll from './pages/Payroll.jsx';
import Employees from './pages/Employees.jsx';
import Analytics from './pages/Analytics.jsx';

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/app" replace />;
  return children;
}

function SplashLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-mist">
      <div className="flex items-center gap-3 text-slate-muted font-body">
        <span className="h-2.5 w-2.5 rounded-full bg-teal animate-ping" />
        Loading Dayflow…
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={loading ? <SplashLoader /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={<Protected><Shell /></Protected>}>
        <Route index element={<DashboardRouter />} />
        <Route path="profile" element={<Profile />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<Leave />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="employees" element={<Protected adminOnly><Employees /></Protected>} />
        <Route path="analytics" element={<Protected adminOnly><Analytics /></Protected>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardRouter() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <DashboardAdmin /> : <DashboardEmployee />;
}
