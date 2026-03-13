'use client';

import { useQueryClient } from '@tanstack/react-query';

interface StatusDotProps {
    label: string;
    queryKey: string;
}

export function StatusDot({ label, queryKey }: StatusDotProps) {
    const queryClient = useQueryClient();
    const queryState = queryClient.getQueryState([queryKey]);
    
    const isError = queryState?.status === 'error';
    const isLoading = queryState?.status === 'pending' && queryState?.fetchStatus === 'fetching';
    const isSuccess = queryState?.status === 'success';

    let dotColor = 'bg-zinc-700';
    if (isError) dotColor = 'bg-red-500 shadow-red-500/50';
    if (isLoading) dotColor = 'bg-amber-500 animate-pulse shadow-amber-500/50';
    if (isSuccess) dotColor = 'bg-emerald-500 shadow-emerald-500/50';

    return (
        <div className="flex items-center gap-1.5" title={`${label}: ${queryState?.status || 'idle'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${dotColor} shadow-sm transition-colors duration-500`} />
            <span className="text-[10px] text-zinc-600">{label}</span>
        </div>
    );
}
