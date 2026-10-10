import { blockingReason, getReadiness, REQUIREMENT_IDS, REQUIREMENT_META } from '@/domain/lifecycle';
import type { HostEvent, RequirementStatus } from '@/domain/types';
import Image from 'next/image';

const STATUS_TEXT: Record<RequirementStatus, string> = {
  satisfied: 'Satisfied', missing: 'Missing', pending: 'Verifying…', error: 'Failed',
};

export function ReadinessChecklist({ event }: { event: HostEvent }) {
  const readiness = getReadiness(event);
  return (
    <section className="transition-all duration-700 ease-out will-change-transform translate-y-0 opacity-100 rounded-xl border border-[#353535] !bg-[#1c1c1c] p-4" aria-labelledby="readiness-h">
      <h2 className="!uppercase !text-xs text-gray-400">Operational readiness</h2>
      <p aria-live="polite" className="text-lg mb-2 font-medium">
        {readiness.satisfied} of {readiness.total} requirements satisfied
      </p>
      <ul className="checklist flex flex-col !mt-3 gap-2">
        {REQUIREMENT_IDS.map((id) => {
          const req = event.requirements[id];
          const reason = blockingReason(req);
          return (
            <li key={id} className={`req req-${req.status} bg-[#292929] rounded-lg px-3 py-2`}>
              {/* <Image src="/svg/production_crew.svg" alt="Production Crew" width={100} height={100} /> */}
              <div className='flex justify-between items-center'>
                <div className='flex flex-col'>
                  <p className='font-medium'>{REQUIREMENT_META[id].label}</p>
                  {reason && <span className="req-reason text-sm text-gray-400">{reason}</span>}
                </div>
                <span className={`${req.status === "satisfied" ? 'text-[#22ff8d]' : req.status === "pending" ? "text-[#ff9312]" : "text-[#ff5d51]"} text-sm`}>{STATUS_TEXT[req.status]}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
