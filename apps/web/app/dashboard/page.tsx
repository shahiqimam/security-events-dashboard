'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '../../components/shell';
import { api } from '../../lib/api';

const colors = ['#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#a78bfa', '#94a3b8'];

export default function DashboardPage() {
  const summary = useQuery({ queryKey: ['summary'], queryFn: () => api<Record<string, number>>('/dashboard/summary') });
  const severity = useQuery({ queryKey: ['severity'], queryFn: () => api<{ name: string; value: string }[]>('/dashboard/severity') });
  const timeline = useQuery({ queryKey: ['timeline'], queryFn: () => api<{ bucket: string; count: string }[]>('/dashboard/timeline') });
  const recent = useQuery({ queryKey: ['recent-events'], queryFn: () => api<{ items: any[] }>('/events?limit=8') });

  return (
    <Shell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-400">Fictional SIEM, EDR, and IAM events normalized for analyst review.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {['totalEvents', 'openEvents', 'investigatingEvents', 'criticalOpen', 'highOpen', 'affectedAssets', 'eventsLast24Hours'].map((key) => (
          <div key={key} className="rounded border border-line bg-panel p-4">
            <div className="text-xs uppercase text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</div>
            <div className="mt-2 text-3xl font-bold">{summary.data?.[key] ?? 0}</div>
          </div>
        ))}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded border border-line bg-panel p-4">
          <h2 className="mb-4 font-semibold">Severity distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severity.data ?? []}>
              <CartesianGrid stroke="#243244" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey={(row) => Number(row.value)}>
                {(severity.data ?? []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded border border-line bg-panel p-4">
          <h2 className="mb-4 font-semibold">Event timeline</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={(timeline.data ?? []).map((row) => ({ ...row, count: Number(row.count) }))}>
              <CartesianGrid stroke="#243244" />
              <XAxis dataKey="bucket" stroke="#94a3b8" tick={false} />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line dataKey="count" stroke="#38bdf8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="mt-6 rounded border border-line bg-panel">
        <h2 className="border-b border-line px-4 py-3 font-semibold">Recent events</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr><th className="p-3">Detected</th><th>Severity</th><th>Source</th><th>Title</th><th>Asset</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(recent.data?.items ?? []).map((event) => (
                <tr key={event.id} className="border-t border-line">
                  <td className="p-3">{new Date(event.detectedAt).toLocaleString()}</td>
                  <td>{event.severity}</td>
                  <td>{event.sourceType}</td>
                  <td>{event.title}</td>
                  <td>{event.assetName ?? '-'}</td>
                  <td>{event.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
