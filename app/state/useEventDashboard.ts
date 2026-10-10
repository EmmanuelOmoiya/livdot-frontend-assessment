'use client';
import { useCallback, useReducer, useRef } from 'react';
import { evaluateTransition } from '@/domain/lifecycle';
import type { EventStatus, RequirementId, RequirementStatus } from '@/domain/types';
import { api } from '@/mock/api';
import { createInitialState, reducer } from './reducer';

const ERROR_DETAIL: Record<RequirementId, string> = {
  crew: 'Crew invite was declined by the producer',
  ingest: 'Ingest handshake failed: check encoder credentials',
  pricing: 'Pricing rejected: currency not supported for payouts',
};

/** Orchestrates async work around the pure reducer. The only place that talks to the API. */
export function useEventDashboard() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const latest = useRef(state);
  latest.current = state;

  const requestTransition = useCallback(async (to: EventStatus) => {
    const s = latest.current;
    if (s.pendingTransition) return;
    const guard = evaluateTransition(s.event, to);
    if (!guard.allowed) return dispatch({ type: 'TRANSITION_REJECTED', to, reasons: guard.reasons });

    const shouldFail = s.failNextTransition;
    dispatch({ type: 'TRANSITION_STARTED', to });
    try {
      await api.transition(s.event.id, to, { fail: shouldFail });
      dispatch({ type: 'TRANSITION_SUCCEEDED', to });
    } catch (e) {
      dispatch({ type: 'TRANSITION_FAILED', to, message: e instanceof Error ? e.message : 'Unknown error' });
    }
  }, []);

  /** Requirements resolve asynchronously: show `pending` first, then the outcome. */
  const setRequirement = useCallback(async (id: RequirementId, outcome: RequirementStatus) => {
    if (outcome === 'missing' || outcome === 'pending') {
      return dispatch({ type: 'REQUIREMENT_UPDATED', id, status: outcome });
    }
    dispatch({ type: 'REQUIREMENT_UPDATED', id, status: 'pending' });
    await api.verifyRequirement(id);
    dispatch({ type: 'REQUIREMENT_UPDATED', id, status: outcome, detail: outcome === 'error' ? ERROR_DETAIL[id] : undefined });
  }, []);

  return { state, dispatch, requestTransition, setRequirement };
}
