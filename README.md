## LIVDOT Frontend Assessment
# LIV DOT · Host Event Dashboard

Next.js (App Router) + TypeScript. No backend: server behaviour is simulated by `src/mock/api.ts` and a simulation panel.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests for the pure domain logic
npm run typecheck
```

## Try this walkthrough
1. Start in **Draft**. Click *Schedule event*: blocked (no start time). Use **Start time → Set** in the simulation panel, then schedule.
2. In **Scheduled**, *Go live* is blocked and lists exactly which requirements are missing.
3. **Satisfy** each requirement (each goes `Verifying…` first). On the last one the event auto-promotes to **Ready**.
4. Hit **Remove** on a requirement while Ready: the event demotes to Scheduled and the log says why.
5. **Fail** a requirement to see an error state with backend detail.
6. Toggle **Fail next transition**, then act: error shown, state unchanged.
7. Go live, then set **Stream health → failed** to see the live-failure alert; add refund requests; end the broadcast.
8. *Enable replay* stays blocked until **Recording → Mark ready**.

## State modeling
- **Lifecycle** is a union type (`EventStatus`) plus one `TRANSITIONS` map in `domain/lifecycle.ts`. No status checks are scattered through components.
- **Readiness is derived, never stored.** Each requirement is `missing | pending | satisfied | error`. `getReadiness()` computes the aggregate and the human-readable reasons.
- **`scheduled ↔ ready` is derived** via `reconcile()`, applied in the reducer after any requirement change. Host-initiated moves (`schedule`, `go live`, `end`, `enable replay`) are explicit transitions.
- **Blocked actions** are modeled as data: `evaluateTransition()` returns `{ allowed: false, reasons[] }`. The UI renders the same reasons the logic produced, so there is no duplicated rule text.
- **Async/incomplete**: requirements pass through `pending`; transitions set `pendingTransition`, which disables actions and marks the stepper. A failed transition leaves status untouched and surfaces a `notice`.

## Architecture
```
domain/   pure TS: types, transition map, readiness, guards (unit-tested)
state/    reducer (pure, synchronous) + useEventDashboard (async orchestration, only API caller)
mock/     simulated backend
components/  presentational; receive state + callbacks, hold no business rules
```
`useReducer` is enough here: one aggregate, a small action set, and a testable reducer. With a real backend I'd move server state to TanStack Query (events are server-owned) and keep the domain layer unchanged.

## Tradeoffs and assumptions
- Blocked buttons use `aria-disabled` rather than `disabled` so keyboard and screen-reader users can still reach the explanation.
- The client guard is advisory: the server remains the authority, which is why `TRANSITION_FAILED` exists.
- Out of scope: auth, real-time (I'd use WebSocket/SSE for requirement and stream-health pushes), optimistic updates (money and broadcast state favour confirmed state), race handling for overlapping requirement checks (would use per-requirement request versioning), persistence.
- Edge case added: stream failure while Live, plus refund requests. Ending a broadcast stays allowed when the stream is failed.
- The Live → Completed path does not re-check readiness; losing a requirement mid-broadcast does not demote the event.
