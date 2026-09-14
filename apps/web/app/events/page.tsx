'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Shell } from '../../components/shell';
import { api, severityClass } from '../../lib/api';

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const query = useMemo(() => new URLSearchParams({ limit: '25', ...(search ? { search } : {}), ...(status ? { status } : {}) }).toString(), [search, status]);
  const events = useQuery({ queryKey: ['events', query], queryFn: () => api<{ items: any[]; total: number }>(`/events?${query}`) });

  return (
    <Shell>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-slate-400">{events.data?.total ?? 0} normalized events</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 rounded border border-line bg-panel px-3 py-2">
            <Search size={16} />
            <input className="bg-transparent outline-none" placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <select className="rounded border border-line bg-panel px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All status</option>
            <option>OPEN</option>
            <option>INVESTIGATING</option>
            <option>RESOLVED</option>
            <option>FALSE_POSITIVE</option>
          </select>
        </div>
      </header>
      <div className="overflow-x-auto rounded border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr><th className="p-3">Severity</th><th>Title</th><th>Source</th><th>Asset</th><th>User</th><th>Status</th><th>Detected</th></tr>
          </thead>
          <tbody>
            {(events.data?.items ?? []).map((event) => (
              <tr key={event.id} className="border-t border-line hover:bg-white/5">
                <td className="p-3"><span className={`badge ${severityClass(event.severity)}`}>{event.severity}</span></td>
                <td><Link className="font-medium text-sky-300" href={`/events/${event.id}`}>{event.title}</Link></td>
                <td>{event.sourceType}</td>
                <td>{event.assetName ?? '-'}</td>
                <td>{event.username ?? '-'}</td>
                <td>{event.status}</td>
                <td>{new Date(event.detectedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
