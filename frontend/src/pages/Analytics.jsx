import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/client';

const PIE_COLORS = ['#0E7C86', '#F5B500', '#E1553F'];

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/analytics/overview').then(({ data }) => setData(data)); }, []);

  if (!data) return <p className="text-slate-muted">Loading analytics…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Analytics &amp; reports</h1>
        <p className="text-slate-muted mt-1">A read on how the workweek is actually going.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-ink mb-4">Attendance trend, last 7 days</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.attendanceTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#9DB6B822" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#5B7A7D' }} tickFormatter={(d) => d.slice(5)} />
            <YAxis tick={{ fontSize: 12, fill: '#5B7A7D' }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" name="Present" stroke="#0E7C86" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="halfDay" name="Half-day" stroke="#F5B500" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="leave" name="Leave" stroke="#E1553F" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Headcount by department</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#9DB6B822" />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#5B7A7D' }} />
              <YAxis tick={{ fontSize: 12, fill: '#5B7A7D' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0E7C86" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Leave requests by status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.leaveByStatus} dataKey="count" nameKey="status" outerRadius={90} label>
                {data.leaveByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-ink mb-4">Leave requests by type</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.leaveByType} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#9DB6B822" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#5B7A7D' }} />
            <YAxis type="category" dataKey="leave_type" tick={{ fontSize: 12, fill: '#5B7A7D' }} width={80} />
            <Tooltip />
            <Bar dataKey="count" fill="#F5B500" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
