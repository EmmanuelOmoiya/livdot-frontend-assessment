import type { HostEvent } from '@/domain/types';

export function StreamAlert({ event }: { event: HostEvent }) {
  if (event.status !== 'live' || event.streamHealth === 'healthy') return null;
  const failed = event.streamHealth === 'failed';
  return (
    <div className={`font-inter !my-4 bg-[#1c1c1c] border border-[#ffffff1a] rounded-lg gap-1 max-w-md w-full !py-2 !px-3 notice-${failed ? 'error' : 'warn'}`} role="alert">
      <p className='text-md font-medium'>{failed ? 'Stream has failed' : 'Stream is degraded'}</p>
      <p className="text-sm leading-[1.42857]">
        {failed
          ? 'Viewers cannot watch. Check the ingest and contact your crew. Expect refund requests; you can still end the broadcast.'
          : 'Viewers may see buffering. Check encoder bitrate and network.'}
      </p>
    </div>
  );
}
