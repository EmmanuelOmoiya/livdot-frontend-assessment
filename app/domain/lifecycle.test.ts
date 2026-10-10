import { describe, expect, it } from 'vitest';
import { evaluateTransition, getReadiness, reconcile } from './lifecycle';
import type { HostEvent, RequirementId, RequirementStatus } from './types';

const make = (status: HostEvent['status'], reqs: Partial<Record<RequirementId, RequirementStatus>> = {}): HostEvent => ({
  id: 'e', title: 'T', startsAt: '2026-11-01T18:00:00Z', status,
  requirements: {
    crew: { id: 'crew', status: reqs.crew ?? 'satisfied' },
    ingest: { id: 'ingest', status: reqs.ingest ?? 'satisfied' },
    pricing: { id: 'pricing', status: reqs.pricing ?? 'satisfied' },
  },
  streamHealth: 'healthy', recordingReady: false, ticketsSold: 0, refundRequests: 0,
});

describe('lifecycle', () => {
  it('derives readiness and lists reasons', () => {
    const r = getReadiness(make('scheduled', { crew: 'missing', ingest: 'pending' }));
    expect(r.ready).toBe(false);
    expect(r.reasons).toHaveLength(2);
  });
  it('reconciles scheduled <-> ready', () => {
    expect(reconcile(make('scheduled'))).toBe('ready');
    expect(reconcile(make('ready', { crew: 'missing' }))).toBe('scheduled');
    expect(reconcile(make('live', { crew: 'missing' }))).toBe('live');
  });
  it('blocks go-live with readiness reasons', () => {
    const g = evaluateTransition(make('scheduled', { pricing: 'missing' }), 'live');
    expect(g).toEqual({ allowed: false, reasons: ['Ticket pricing is not configured'] });
  });
  it('blocks illegal jumps and unprocessed replay', () => {
    expect(evaluateTransition(make('draft'), 'live').allowed).toBe(false);
    expect(evaluateTransition(make('completed'), 'replay').allowed).toBe(false);
  });
});
