import Link from 'next/link';
import { Activity, Database, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-panel px-4 py-5 md:block">
        <div className="mb-8 flex items-center gap-2 text-lg font-bold">
          <ShieldAlert size={22} />
          SentinelView
        </div>
        <nav className="space-y-1 text-sm">
          <Link className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5" href="/dashboard"><LayoutDashboard size={16} />Dashboard</Link>
          <Link className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5" href="/events"><Activity size={16} />Events</Link>
          <Link className="flex items-center gap-2 rounded px-3 py-2 hover:bg-white/5" href="/sources"><Database size={16} />Sources</Link>
        </nav>
      </aside>
      <main className="md:pl-60">
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
