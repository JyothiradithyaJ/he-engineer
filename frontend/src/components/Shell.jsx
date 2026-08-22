import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import Chatbot from './Chatbot.jsx';

const employeeLinks = [
  { to: '/app', label: 'Dashboard', end: true, icon: HomeIcon },
  { to: '/app/attendance', label: 'Attendance', icon: ClockIcon },
  { to: '/app/leave', label: 'Leave', icon: CalendarIcon },
  { to: '/app/payroll', label: 'Payroll', icon: WalletIcon },
  { to: '/app/profile', label: 'Profile', icon: UserIcon },
];

const adminLinks = [
  { to: '/app', label: 'Dashboard', end: true, icon: HomeIcon },
  { to: '/app/employees', label: 'Employees', icon: UsersIcon },
  { to: '/app/attendance', label: 'Attendance', icon: ClockIcon },
  { to: '/app/leave', label: 'Leave approvals', icon: CalendarIcon },
  { to: '/app/payroll', label: 'Payroll', icon: WalletIcon },
  { to: '/app/analytics', label: 'Analytics', icon: ChartIcon },
  { to: '/app/profile', label: 'Profile', icon: UserIcon },
];

export default function Shell() {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await api.get(`/employees/${user.id}/notifications`);
    setNotifications(data.notifications);
  };

  useEffect(() => { loadNotifications(); }, [user?.id]);

  const unread = notifications.filter((n) => !n.is_read).length;

  const openNotifs = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && unread > 0) {
      await api.post(`/employees/${user.id}/notifications/read-all`);
      setNotifications((ns) => ns.map((n) => ({ ...n, is_read: 1 })));
    }
  };

  return (
    <div className="min-h-screen flex bg-mist">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink text-mist px-5 py-6">
        <div className="flex items-center gap-2.5 px-2 mb-10">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-amber text-ink font-display font-bold">D</span>
          <span className="font-display font-semibold text-lg">Dayflow</span>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-amber text-ink' : 'text-mist/70 hover:bg-mist/10 hover:text-mist'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-mist/60 hover:bg-mist/10 hover:text-mist transition-colors">
          <LogoutIcon className="h-4.5 w-4.5" /> Sign out
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 px-6 md:px-8 py-4 border-b border-slate-faint/20 bg-paper">
          <div className="md:hidden flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-amber text-ink font-display font-bold text-sm">D</span>
            <span className="font-display font-semibold text-ink">Dayflow</span>
          </div>
          <div className="hidden md:block text-sm text-slate-muted">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={openNotifs} className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-mist transition-colors">
                <BellIcon className="h-5 w-5 text-slate-muted" />
                {unread > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-coral" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 card p-3 z-30 max-h-96 overflow-auto">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted px-2 pb-2">Notifications</p>
                  {notifications.length === 0 && <p className="text-sm text-slate-muted px-2 py-4">You're all caught up.</p>}
                  {notifications.map((n) => (
                    <div key={n.id} className="px-2 py-2.5 text-sm border-b border-slate-faint/10 last:border-0">
                      <p className="text-ink">{n.message}</p>
                      <p className="text-xs text-slate-faint font-mono mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-full bg-teal/15 text-teal font-display font-semibold grid place-items-center">
                {user?.name?.[0] || 'U'}
              </span>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-ink">{user?.name}</p>
                <p className="text-xs text-slate-muted capitalize">{user?.role === 'admin' ? 'HR admin' : user?.designation}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 md:px-8 py-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-amber text-ink shadow-soft grid place-items-center hover:bg-amber-deep transition-colors z-40"
        aria-label="Open Dayflow Assistant"
      >
        <ChatIcon className="h-6 w-6" />
      </button>
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}
    </div>
  );
}

/* --- inline icon set (no external icon package needed) --- */
function HomeIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>); }
function ClockIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>); }
function CalendarIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>); }
function WalletIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16" cy="14" r="1.3" fill="currentColor" stroke="none" /></svg>); }
function UserIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" /></svg>); }
function UsersIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c1.1-3.6 3.6-5.4 6.5-5.4s5.4 1.8 6.5 5.4" /><circle cx="17.5" cy="9" r="2.6" /><path d="M15.5 14.4c2.4.2 4.2 1.9 5 5.6" /></svg>); }
function ChartIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M4 20V10M12 20V4M20 20v-7" /></svg>); }
function LogoutIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>); }
function BellIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>); }
export function ChatIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>); }
