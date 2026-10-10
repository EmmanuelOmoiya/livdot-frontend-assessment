
type BadgeVariant = 'draft' | 'scheduled' | 'ready' | 'live' | 'default' | 'info' | 'error' | 'warning';
type SizeVariant = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant: BadgeVariant
  text?: string
  size?: SizeVariant
}

export default function Badge({ variant, text, size }: BadgeProps) {
  const styles = {
    default: 'text-[#fcfcfc] bg-[#27272a80]',
    error: 'text-[#fcfcfc] bg-[#db3b3e]',
    info: 'text-[#fcfcfc] bg-[#0485f7]',
    warning: 'text-[#18181b] bg-[#f7b750]',
    draft: 'text-[#27272a] bg-[#ffffff]',
    scheduled: 'bg-[#f7b7501f] text-[#f9cb86]',
    ready: 'bg-[#17c9641f] text-[#74d88f]',
    live: 'bg-[#ff3f3f]/20 text-[#ff3f3f]',
  }

//   const sizing = {
//     lg: 
//   }

  return (
    <span className={`px-2 whitespace-nowrap py-0\.5 font border border-[#0000] font-inter text-sm rounded-4xl overflow-hidden gap-1 justify-center items-center shrink-0 w-fit h-6 inline-flex capitalize ${styles[variant]}`}>
      {text ? text : variant}
    </span>
  )
}
