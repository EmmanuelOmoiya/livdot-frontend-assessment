'use client';
import { useEventDashboard } from '@/state/useEventDashboard';
import { EventHeader } from './EventHeader';
import { LifecycleStepper } from './LifecycleStepper';
import { ReadinessChecklist } from './ReadinessChecklist';
import { ActionPanel } from './ActionPanel';
import { StreamAlert } from './StreamAlert';
import { SimulationPanel } from './SimulationPanel';
import { ActivityLog } from './ActivityLog';
import Image from 'next/image';

export function Dashboard() {
    const { state, dispatch, requestTransition, setRequirement } = useEventDashboard();
    const { event } = state;

    return (
        <main className="grid gap-4 font-inter md:pt-24">
            <div className="fixed top-0 w-full !z-12 py-6 border-b border-[#ffffff1a] px-10 flex items-center gap-x-3">
                <Image src="/logo.svg" alt="LIVDOT Logo" width={100} height={100} />
                <span className="px-2 whitespace-nowrap py-0\.5 font bg-base/20 text-base border border-[#0000] font-inter text-xs rounded-4xl overflow-hidden gap-1 justify-center items-center shrink-0 w-fit h-5 inline-flex ">
                    Assessment
                </span>
            </div>
            <div className="flex h-screen font-inter flex-col items-center justify-center p-6 text-center text-white md:hidden">
                <h2 className="text-xl font-bold font-chillax">Desktop Only</h2>
                <p className="mt-2 text-gray-400">This application is optimized for larger screens. Please switch to a tablet or computer.</p>
            </div>
            <div className='hidden md:block max-w-6xl px-10 !mx-auto w-full py-3'>
                <EventHeader event={event} />
                <StreamAlert event={event} />
                <LifecycleStepper status={event.status} pending={state.pendingTransition} />
                <div className="grid grid-cols-2 gap-4 !mb-6">
                    <ReadinessChecklist event={event} />
                    <ActionPanel state={state} onAction={requestTransition} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SimulationPanel state={state} dispatch={dispatch} setRequirement={setRequirement} />
                    <ActivityLog log={state.log} />
                </div>
            </div>
        </main>
    );
}
