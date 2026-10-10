import { STATUS_META, STATUS_ORDER } from '@/domain/lifecycle';
import type { EventStatus } from '@/domain/types';

export function LifecycleStepper({ status, pending }: { status: EventStatus; pending: EventStatus | null }) {
    const current = STATUS_ORDER.indexOf(status);
    const progressPercent = STATUS_ORDER.length > 1
        ? Math.min(100, Math.max(0, ((current) / (STATUS_ORDER.length)) * 100))
        : 0;
    return (
        <nav aria-label="Event lifecycle" className="!my-10 !mb-20 !pb-10 ">
            <ol className="stepper !relative grid items-center gap-4 grid-cols-6">
                <div className="absolute left-19 top-1/2 h-1 w-[85%] -translate-y-1/2 bg-[#1f1f1f] rounded-full" />
                <div
                    className="absolute left-19 top-1/2 h-1 bg-[#e50000] rounded-full -translate-y-1/2 transition-all duration-500 ease-in-out"
                    style={{ width: `${progressPercent}%` }}
                />

                {STATUS_ORDER.map((s, i) => {

                    const kind = i < current ? 'done' : i === current ? 'current' : 'upcoming';
                    return (

                        <li key={s} className={`step step-${kind} !relative !z-10 flex flex-col gap-1 items-center ${pending === s ? 'step-pending' : ''}`}
                            aria-current={kind === 'current' ? 'step' : undefined}>
                            <div
                                className={`flex z-1 h-10 w-10 items-center justify-center rounded-full border-2 font-semibold shadow-sm transition-all duration-500 ${i < current && i === STATUS_ORDER.length - 1
                                    ? "border-red-600 bg-[#e50000] text-white"
                                    : i === current
                                        ? "border-[#e50000] bg-[#171717] border-1 "
                                        : "border-[#1f1f1f] bg-[#171717] text-gray-500"
                                    }`}
                            >
                                {i < current && i === STATUS_ORDER.length - 1 ? (
                                    <p>H</p>
                                ) : (
                                    <span className={`w-3 h-3 ${i === current ? 'bg-[#e50000]' : i < current ? 'bg-[#e50000]' : 'bg-[#2a2a2a]'} rounded-full`}></span>
                                )}
                            </div>
                            <div className='absolute top-12 flex flex-col text-center'>
                                <span className={`step-label text-center text-md font-medium transition-colors duration-300 font-bold ${i == current ? 'text-white' : i < current ? "text-white" : "text-gray-400"}`}>{STATUS_META[s].label}</span>
                                <span className={`step-desc text-xs text-center font-medium transition-colors duration-300 text-gray-400`}>{pending === s ? 'Applying…' : STATUS_META[s].description}</span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
