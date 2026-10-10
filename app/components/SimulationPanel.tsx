import { REQUIREMENT_IDS, REQUIREMENT_META } from '@/domain/lifecycle';
import type { RequirementId, RequirementStatus, StreamHealth } from '@/domain/types';
import type { Action, DashboardState } from '@/state/reducer';

interface Props {
  state: DashboardState;
  dispatch: (a: Action) => void;
  setRequirement: (id: RequirementId, s: RequirementStatus) => void;
}

export function SimulationPanel({ state, dispatch, setRequirement }: Props) {
  const { event } = state;
  const patch = (p: Action extends infer A ? A extends { type: 'EVENT_PATCHED'; patch: infer P } ? P : never : never) =>
    dispatch({ type: 'EVENT_PATCHED', patch: p });

  return (
    <section className="transition-all duration-700 ease-out will-change-transform translate-y-0 opacity-100 rounded-xl border border-[#353535] !bg-[#1c1c1c] p-4" aria-labelledby="sim-h">
      <h2 id="sim-h" className='!uppercase !text-xs text-gray-400'>Simulate backend</h2>
      <p className="text-gray-200 text-sm !mb-4">Stand-in for server events, so every state can be reviewed.</p>

      {REQUIREMENT_IDS.map((id) => (
        <div key={id} className="flex justify-between !mb-2">
          <span className='font-medium text-md'>{REQUIREMENT_META[id].label}</span>
          <span className="flex gap-1">
            <button onClick={() => setRequirement(id, 'satisfied')} className='text-[#74d88f] bg-[#17c9641f] rounded-2xl p-2 px-3 hover:bg-[#409a67] hover:text-[#fcfcfc] transition-all duration-300 cursor-pointer ease-out will-change-transform'>Satisfy</button>
            <button onClick={() => setRequirement(id, 'missing')} className='text-[#ffbe55] bg-[#40311a] rounded-2xl p-2 px-3 hover:text-[#18181b] hover:bg-[#f7b750] transition-all duration-300 cursor-pointer ease-out will-change-transform'>Remove</button>
            <button onClick={() => setRequirement(id, 'error')} className='text-[#d44749] bg-[#3b191a] rounded-2xl p-2 px-3 hover:bg-[#db3b3e] hover:text-[#fcfcfc] transition-all duration-300 cursor-pointer ease-out will-change-transform'>Fail</button>
          </span>
        </div>
      ))}

      <div className="flex justify-between !mb-2">
        <span>Start time</span>
        <span className="flex gap-1">
          <button onClick={() => patch({ startsAt: new Date(Date.now() + 7 * 864e5).toISOString() })} className='text-[#74d88f] bg-[#17c9641f] rounded-2xl p-2 px-3 hover:bg-[#409a67] hover:text-[#fcfcfc] transition-all duration-300 cursor-pointer ease-out will-change-transform'>Set</button>
          <button onClick={() => patch({ startsAt: null })} className='text-[#d44749] bg-[#3b191a] rounded-2xl p-2 px-3 hover:bg-[#db3b3e] hover:text-[#fcfcfc] transition-all duration-300 cursor-pointer ease-out will-change-transform'>Clear</button>
        </span>
      </div>
      <div className="flex justify-between !mb-2">
        <span>Recording</span>
        <span className="">
          <button onClick={() => patch({ recordingReady: !event.recordingReady })} className='text-[#74d88f] bg-[#17c9641f] rounded-2xl p-2 px-3 hover:bg-[#409a67] hover:text-[#fcfcfc] transition-all duration-300 cursor-pointer ease-out will-change-transform'>
            {event.recordingReady ? 'Mark processing' : 'Mark ready'}
          </button>
        </span>
      </div>
      <div className="flex justify-between !mb-2">
        <span>Stream health</span>
        <span className="flex gap-1">
          {(['healthy', 'degraded', 'failed'] as StreamHealth[]).map((h) => (
            <button key={h} onClick={() => patch({ streamHealth: h })} aria-pressed={event.streamHealth === h} className='text-[#fcfcfc] bg-[#27272a80] !capitalize rounded-2xl p-2 px-3 transition-all duration-300 cursor-pointer ease-out will-change-transform'>{h}</button>
          ))}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Next API call</span>
        <span className="flex gap-1">
          <button aria-pressed={state.failNextTransition} onClick={() => dispatch({ type: 'FAIL_NEXT_TOGGLED' })} className='text-[#d44749] bg-[#3b191a] rounded-2xl p-2 px-3 hover:bg-[#db3b3e] hover:text-[#fcfcfc] transition-all duration-300 cursor-pointer ease-out will-change-transform'>
            Fail next transition
          </button>
          <button onClick={() => dispatch({ type: 'REFUND_REQUESTED' })} className='text-[#ffbe55] bg-[#40311a] rounded-2xl p-2 px-3 hover:text-[#18181b] hover:bg-[#f7b750] transition-all duration-300 cursor-pointer ease-out will-change-transform'>Refund request</button>
        </span>
      </div>
    </section>
  );
}
