'use client';

import { useQuery } from '@tanstack/react-query';
import { Shell } from '../../components/shell';
import { api } from '../../lib/api';

export default function SourcesPage() {
  const sources = useQuery({ queryKey: ['sources'], queryFn: () => api<any[]>('/sources') });
  return (
    <Shell>
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Sources</h1>
        <p className="text-sm text-slate-400">Recent ingestion state for fictional event sources.</p>
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        {(sources.data ?? []).map((source) => (
          <article key={source.id} className="rounded border border-line bg-panel p-4">
            <h2 className="font-semibold">{source.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{source.sourceType}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt>State</dt><dd>{source.activityState}</dd></div>
              <div className="flex justify-between"><dt>Total events</dt><dd>{source.totalEvents}</dd></div>
              <div className="flex justify-between"><dt>Last event</dt><dd>{source.lastEventAt ? new Date(source.lastEventAt).toLocaleString() : '-'}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </Shell>
  );
}
