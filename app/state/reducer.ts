import { initialEvent } from '@/mock/api';
import { reconcile, STATUS_META } from '@/domain/lifecycle';
import type { EventStatus, HostEvent, Requirement, RequirementId, StreamHealth } from '@/domain/types';

export interface LogEntry { id: number; tone: 'info' | 'success' | 'warn' | 'error'; message: string }

export interface DashboardState {
  event: HostEvent;
  /** In-flight transition. Disables all actions while set. */
  pendingTransition: EventStatus | null;
  /** Last blocked or failed action, shown next to the action panel. */
  notice: { tone: 'warn' | 'error'; title: string; reasons: string[] } | null;
  failNextTransition: boolean;
  log: LogEntry[];
}

export type Action =
  | { type: 'REQUIREMENT_UPDATED'; id: RequirementId; status: Requirement['status']; detail?: string }
  | { type: 'TRANSITION_REJECTED'; to: EventStatus; reasons: string[] }
  | { type: 'TRANSITION_STARTED'; to: EventStatus }
  | { type: 'TRANSITION_SUCCEEDED'; to: EventStatus }
  | { type: 'TRANSITION_FAILED'; to: EventStatus; message: string }
  | { type: 'EVENT_PATCHED'; patch: Partial<Pick<HostEvent, 'startsAt' | 'recordingReady' | 'streamHealth'>> }
  | { type: 'REFUND_REQUESTED' }
  | { type: 'FAIL_NEXT_TOGGLED' };

export const createInitialState = (): DashboardState => ({
  event: initialEvent, pendingTransition: null, notice: null, failNextTransition: false, log: [],
});

const push = (s: DashboardState, tone: LogEntry['tone'], message: string): LogEntry[] =>
  [{ id: (s.log[0]?.id ?? 0) + 1, tone, message }, ...s.log].slice(0, 30);

/** Applies derived status (scheduled <-> ready) and logs why it moved. */
function withReconcile(s: DashboardState, cause: string): DashboardState {
  if (s.pendingTransition) return s;
  const next = reconcile(s.event);
  if (next === s.event.status) return s;
  const promoted = next === 'ready';
  return {
    ...s,
    event: { ...s.event, status: next },
    log: push(s, promoted ? 'success' : 'warn',
      promoted ? 'All requirements satisfied: event is Ready for streaming'
               : `${cause}: event moved back to Scheduled`),
  };
}

export function reducer(s: DashboardState, a: Action): DashboardState {
  switch (a.type) {
    case 'REQUIREMENT_UPDATED': {
      const req: Requirement = { id: a.id, status: a.status, detail: a.detail };
      const next = { ...s, event: { ...s.event, requirements: { ...s.event.requirements, [a.id]: req } } };
      return withReconcile({ ...next, log: push(next, a.status === 'error' ? 'error' : 'info', `${a.id} → ${a.status}`) }, `${a.id} became ${a.status}`);
    }
    case 'EVENT_PATCHED': {
      const event = { ...s.event, ...a.patch };
      const note = a.patch.streamHealth && a.patch.streamHealth !== 'healthy'
        ? push(s, 'error', `Stream ${a.patch.streamHealth}`) : s.log;
      return { ...s, event, log: note };
    }
    case 'TRANSITION_REJECTED':
      return { ...s, notice: { tone: 'warn', title: `Can't ${STATUS_META[a.to].label.toLowerCase()} yet`, reasons: a.reasons },
        log: push(s, 'warn', `Blocked: ${a.reasons.join('; ')}`) };
    case 'TRANSITION_STARTED':
      return { ...s, pendingTransition: a.to, notice: null, failNextTransition: false };
    case 'TRANSITION_SUCCEEDED': {
      const done = { ...s, pendingTransition: null,
        event: { ...s.event, status: a.to }, log: push(s, 'success', `Event is now ${STATUS_META[a.to].label}`) };
      return withReconcile(done, 'Requirements changed during transition');
    }
    case 'TRANSITION_FAILED':
      return { ...withReconcile({ ...s, pendingTransition: null }, 'Requirements changed'),
        notice: { tone: 'error', title: 'Change failed', reasons: [a.message] },
        log: push(s, 'error', a.message) };
    case 'REFUND_REQUESTED':
      return { ...s, event: { ...s.event, refundRequests: s.event.refundRequests + 1 }, log: push(s, 'warn', 'Viewer requested a refund') };
    case 'FAIL_NEXT_TOGGLED':
      return { ...s, failNextTransition: !s.failNextTransition };
  }
}

export type { StreamHealth };
