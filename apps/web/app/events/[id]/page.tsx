'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shell } from '../../../components/shell';
import { api, severityClass } from '../../../lib/api';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const event = useQuery({ queryKey: ['event', params.id], queryFn: () => api<any>(`/events/${params.id}`) });
  const notes = useQuery({ queryKey: ['notes', params.id], queryFn: () => api<any[]>(`/events/${params.id}/notes`) });
  const history = useQuery({ queryKey: ['history', params.id], queryFn: () => api<any[]>(`/events/${params.id}/history`) });
  const status = useMutation({
    mutationFn: (value: string) => api(`/events/${params.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: value }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['event', params.id] })
  });
  const addNote = useMutation({
    mutationFn: (content: string) => api(`/events/${params.id}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['notes', params.id] });
      client.invalidateQueries({ queryKey: ['history', params.id] });
    }
  });

  const row = event.data;
  return (
    <Shell>
      <header className="mb-5">
        <h1 className="text-2xl font-bold">{row?.title ?? 'Event detail'}</h1>
        {row && <p className="text-sm text-slate-400">{row.sourceType} / {row.sourceEventId}</p>}
      </header>
      {row && (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            {[
              ['Severity', <span key="severity" className={`badge ${severityClass(row.severity)}`}>{row.severity}</span>],
              ['Category', row.category],
              ['Status', row.status],
              ['Detected', new Date(row.detectedAt).toLocaleString()],
              ['First seen', new Date(row.firstSeenAt).toLocaleString()],
              ['Last seen', new Date(row.lastSeenAt).toLocaleString()],
              ['Occurrences', row.occurrenceCount],
              ['Asset', row.assetName ?? '-'],
              ['Username', row.username ?? '-'],
              ['Source IP', row.sourceIp ?? '-'],
              ['Assignee', row.assignedTo?.name ?? '-']
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded border border-line bg-panel p-4">
                <div className="text-xs uppercase text-slate-400">{label}</div>
                <div className="mt-2">{value}</div>
              </div>
            ))}
          </section>
          <section className="mt-5 rounded border border-line bg-panel p-4">
            <h2 className="mb-3 font-semibold">Workflow</h2>
            <div className="flex flex-wrap gap-2">
              {['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'].map((value) => (
                <button key={value} onClick={() => status.mutate(value)} className="rounded border border-line px-3 py-2 text-sm hover:bg-white/5">{value}</button>
              ))}
            </div>
          </section>
          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded border border-line bg-panel p-4">
              <h2 className="mb-3 font-semibold">Raw Event</h2>
              <pre className="max-h-96 overflow-auto rounded bg-black/30 p-3 text-xs">{JSON.stringify(row.rawPayload, null, 2)}</pre>
            </div>
            <div className="rounded border border-line bg-panel p-4">
              <h2 className="mb-3 font-semibold">Notes</h2>
              <form onSubmit={(formEvent) => {
                formEvent.preventDefault();
                const form = formEvent.currentTarget;
                const data = new FormData(form);
                addNote.mutate(String(data.get('content') ?? ''));
                form.reset();
              }} className="mb-3 flex gap-2">
                <input name="content" className="min-w-0 flex-1 rounded border border-line bg-[#0b1220] px-3 py-2" placeholder="Add a note" />
                <button className="rounded bg-sky-600 px-3 py-2">Add</button>
              </form>
              <div className="space-y-2 text-sm">
                {(notes.data ?? []).map((note) => <div key={note.id} className="rounded border border-line p-3">{note.content}</div>)}
              </div>
            </div>
          </section>
          <section className="mt-5 rounded border border-line bg-panel p-4">
            <h2 className="mb-3 font-semibold">History</h2>
            <div className="space-y-2 text-sm">
              {(history.data ?? []).map((item) => <div key={item.id} className="rounded border border-line p-3">{item.action} · {new Date(item.createdAt).toLocaleString()}</div>)}
            </div>
          </section>
        </>
      )}
    </Shell>
  );
}
