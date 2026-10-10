import { actionLabel, evaluateTransition, PRIMARY_ACTION, STATUS_META } from '@/domain/lifecycle';
import type { DashboardState } from '@/state/reducer';
import type { EventStatus } from '@/domain/types';

export function ActionPanel({ state, onAction }: { state: DashboardState; onAction: (to: EventStatus) => void }) {
  const { event, pendingTransition, notice } = state;
  const target = PRIMARY_ACTION[event.status];
  const guard = target ? evaluateTransition(event, target) : null;
  const busy = pendingTransition !== null;
  const blocked = guard && !guard.allowed;

  return (
    <section className="transition-all duration-700 ease-out will-change-transform translate-y-0 opacity-100 rounded-xl border border-[#353535] !bg-[#1c1c1c] p-4" aria-labelledby="actions-h">
      <h2 id="actions-h" className='!uppercase !text-xs text-gray-400'>Next step</h2>
      {!target ? (
        <p className="muted">This event is at the end of its lifecycle. No further actions.</p>
      ) : (
        <>
          <p className="muted my-3 text-lg font-medium !mb-3">Next action: {STATUS_META[target].label}</p>
          <button className={`w-full cursor-pointer bg-base text-white rounded-full py-3 text-md ${ busy || blocked || undefined ? 'bg-base/20 text-white/40 !cursor-not-allowed' : 'bg-base text-white' } transition-all duration-400 ease-out will-change-transform`} aria-disabled={busy || blocked || undefined} aria-describedby="block-reasons"
                  onClick={() => !busy && onAction(target)}>
            {busy ? 'Applying…' : actionLabel(target)}
          </button>
          {blocked && !busy && (
            <div id="block-reasons" className="blocked notice-warn !mt-4">
              <strong>Blocked</strong>
              <ul>{guard.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          )}
        </>
      )}
      {notice && (
        <div className={`notice notice-${notice.tone}`} role="alert">
          <strong>{notice.title}</strong>
          <ul>{notice.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
    </section>
  );
}
