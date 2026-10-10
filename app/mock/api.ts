import type { EventStatus, HostEvent } from '@/domain/types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const initialEvent: HostEvent = {
  id: 'evt_001',
  title: 'Lagos Tech Summit: Closing Keynote',
  startsAt: null,
  status: 'draft',
  requirements: {
    crew: { id: 'crew', status: 'missing' },
    ingest: { id: 'ingest', status: 'missing' },
    pricing: { id: 'pricing', status: 'missing' },
  },
  streamHealth: 'healthy',
  recordingReady: false,
  ticketsSold: 128,
  refundRequests: 0,
};

/** Simulated backend. Swap for real fetch calls; the hook's contract stays the same. */
export const api = {
  async transition(_id: string, to: EventStatus, opts: { fail?: boolean } = {}) {
    await wait(900);
    if (opts.fail) throw new Error(`Server rejected the change to "${to}". Nothing was changed; try again.`);
  },
  async verifyRequirement(_id: string) {
    await wait(1200);
  },
};
