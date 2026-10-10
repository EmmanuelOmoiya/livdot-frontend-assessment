import type { LogEntry } from '@/state/reducer';

export function ActivityLog({ log }: { log: LogEntry[] }) {
  return (
    <section className="transition-all duration-700 ease-out will-change-transform translate-y-0 opacity-100 rounded-xl border border-[#353535] !bg-[#1c1c1c] p-4" aria-labelledby="log-h">
      <h2 id="log-h" className='!uppercase !text-xs text-gray-400'>Activity</h2>
      {log.length === 0 ? (
        <p className="muted">Nothing yet. Use the simulation panel to change requirements.</p>
      ) : (
        <ul className="log" aria-live="polite">
          {log.map((l) => <li key={l.id} className={`flex items-center`}>
            <p className={`w-2 h-2 rounded-full !mr-2 ${l.tone === 'error' ? 'bg-[#db3b3e]': l.tone === "info" ? 'bg-[#0485f7]' : l.tone === "success" ? "bg-[#74d88f]" : "bg-[#f7b750]"}`}></p>
            {l.message}</li>)}
        </ul>
      )}
    </section>
  );
}
