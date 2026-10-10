import type { EventStatus, Guard, HostEvent, Requirement, RequirementId } from './types';

export const STATUS_ORDER: EventStatus[] = ['draft', 'scheduled', 'ready', 'live', 'completed', 'replay'];

export const STATUS_META: Record<EventStatus, { label: string; description: string }> = {
  draft: { label: 'Draft', description: 'Created, not yet scheduled' },
  scheduled: { label: 'Scheduled', description: 'Scheduled, requirements outstanding' },
  ready: { label: 'Ready for streaming', description: 'All requirements satisfied' },
  live: { label: 'Live', description: 'Broadcasting now' },
  completed: { label: 'Completed', description: 'Broadcast ended' },
  replay: { label: 'Replay available', description: 'Catch-up viewing enabled' },
};

/** Single source of truth for legal transitions. scheduled <-> ready is derived (see reconcile). */
export const TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ['scheduled'],
  scheduled: ['ready'],
  ready: ['scheduled', 'live'],
  live: ['completed'],
  completed: ['replay'],
  replay: [],
};

export const REQUIREMENT_META: Record<RequirementId, { label: string; missing: string }> = {
  crew: { label: 'Production crew', missing: 'No production crew assigned' },
  ingest: { label: 'Streaming ingest', missing: 'Streaming ingest is not configured' },
  pricing: { label: 'Ticket pricing', missing: 'Ticket pricing is not configured' },
};

export const REQUIREMENT_IDS = Object.keys(REQUIREMENT_META) as RequirementId[];

/** Why a single requirement is blocking, or null if satisfied. */
export function blockingReason(req: Requirement): string | null {
  const { label, missing } = REQUIREMENT_META[req.id];
  switch (req.status) {
    case 'satisfied': return null;
    case 'missing': return missing;
    case 'pending': return `${label} is still being verified`;
    case 'error': return req.detail ?? `${label} check failed`;
  }
}

/** Readiness is derived from requirements, never stored. */
export function getReadiness(event: Pick<HostEvent, 'requirements'>) {
  const reqs = REQUIREMENT_IDS.map((id) => event.requirements[id]);
  const blocking = reqs.filter((r) => r.status !== 'satisfied');
  return {
    ready: blocking.length === 0,
    satisfied: reqs.length - blocking.length,
    total: reqs.length,
    reasons: blocking.map((r) => blockingReason(r)!),
  };
}

const ACTION_LABEL: Partial<Record<EventStatus, string>> = {
  scheduled: 'Schedule event',
  live: 'Go live',
  completed: 'End broadcast',
  replay: 'Enable replay',
};
export const actionLabel = (to: EventStatus) => ACTION_LABEL[to] ?? STATUS_META[to].label;

/** The host-initiated action available from each status (ready/scheduled promotion is automatic). */
export const PRIMARY_ACTION: Partial<Record<EventStatus, EventStatus>> = {
  draft: 'scheduled',
  scheduled: 'live',
  ready: 'live',
  live: 'completed',
  completed: 'replay',
};

export function evaluateTransition(event: HostEvent, to: EventStatus): Guard {
  const reasons: string[] = [];
  const from = event.status;

  if (to === 'live' && from === 'scheduled') {
    reasons.push(...getReadiness(event).reasons);
  } else if (!TRANSITIONS[from].includes(to)) {
    reasons.push(`Cannot move from ${STATUS_META[from].label} to ${STATUS_META[to].label}`);
  }

  if (to === 'scheduled' && from === 'draft') {
    if (!event.title.trim()) reasons.push('Event needs a title');
    if (!event.startsAt) reasons.push('Start date and time not set');
  }
  if (to === 'replay' && !event.recordingReady) reasons.push('Recording is still processing');

  return reasons.length ? { allowed: false, reasons } : { allowed: true };
}

/**
 * Derived status: while scheduled/ready, status follows readiness. Returns the (possibly new) status.
 * Other states are driven only by explicit transitions.
 */
export function reconcile(event: HostEvent): EventStatus {
  if (event.status !== 'scheduled' && event.status !== 'ready') return event.status;
  return getReadiness(event).ready ? 'ready' : 'scheduled';
}
