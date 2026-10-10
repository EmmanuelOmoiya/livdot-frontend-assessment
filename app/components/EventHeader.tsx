import { STATUS_META } from '@/domain/lifecycle';
import type { HostEvent } from '@/domain/types';
import Badge from './ui/Badge';

export function EventHeader({ event }: { event: HostEvent }) {
  return (
    <header className="flex items-center justify-between w-full">
      <div className='grid gap-2'>
        <h1 className="font-chillax tracking-[-0.1rem] !text-3xl">{event.title}</h1>
        <div className='flex gap-2'>
            <Badge text={`${event.startsAt ? new Date(event.startsAt).toLocaleString() : 'No start time set'}`} variant={event.startsAt? 'default' : 'error'}/>
            <Badge text={`${event.ticketsSold} tickets sold`} variant='default'/>
        </div>
        <p className="muted">
          {event.refundRequests > 0 && ` · ${event.refundRequests} refund request${event.refundRequests > 1 ? 's' : ''}`}
        </p>
      </div>
    <Badge variant={event.status as any} />
    </header>
  );
}
