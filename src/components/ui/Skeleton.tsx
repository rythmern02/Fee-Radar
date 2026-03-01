import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-zinc-800/60',
                className
            )}
            {...props}
        />
    );
}

export function SkeletonRow() {
    return (
        <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}

export function SkeletonBreakdown() {
    return (
        <div className="space-y-1">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <div className="border-t border-zinc-800/50 mt-2 pt-2">
                <SkeletonRow />
            </div>
        </div>
    );
}
