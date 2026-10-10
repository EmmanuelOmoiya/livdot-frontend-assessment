export type EventStatus = 'draft' | 'scheduled' | 'ready' | 'live' | 'completed' | 'replay';

export type RequirementId = 'crew' | 'ingest' | 'pricing';
export type RequirementStatus = 'missing' | 'pending' | 'satisfied' | 'error';

export interface Requirement {
  id: RequirementId;
  status: RequirementStatus;
  /** Backend-provided detail, e.g. why verification failed. */
  detail?: string;
}

export type StreamHealth = 'healthy' | 'degraded' | 'failed';

export interface HostEvent {
  id: string;
  title: string;
  startsAt: string | null;
  status: EventStatus;
  requirements: Record<RequirementId, Requirement>;
  streamHealth: StreamHealth;
  recordingReady: boolean;
  ticketsSold: number;
  refundRequests: number;
}

/** A guard result: either allowed, or blocked with human-readable reasons. */
export type Guard = { allowed: true } | { allowed: false; reasons: string[] };
