'use client';

/**
 * StatusIndicator — Shows live connectivity status for external APIs.
 *
 * Must be a Client Component because StatusDot reads React Query cache
 * via useQueryClient(), which is a client-only hook.
 */

import { StatusDot } from './StatusDot';

export function StatusIndicator() {
    return (
        <div className="flex items-center gap-3">
            <StatusDot label="Mempool API" queryKey="btcFeeRates" />
            <StatusDot label="RSK RPC" queryKey="rskGasPrice" />
        </div>
    );
}
