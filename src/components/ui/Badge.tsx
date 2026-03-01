import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'warning' | 'success' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                'transition-colors duration-200',
                variant === 'default' && 'bg-zinc-800 text-zinc-300 border border-zinc-700/50',
                variant === 'warning' &&
                'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                variant === 'success' &&
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                variant === 'info' &&
                'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                className
            )}
            {...props}
        />
    );
}
