'use client';

/**
 * useCrossLayerEstimate — THE HOOK
 *
 * Orchestrates all API fetches and pure math to produce a complete
 * FeeBreakdownResult for a given peg-out amount and speed.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { FeeBreakdownResult, FeeSpeed, BridgeType } from '../types';
import { fetchBitcoinFeeRates, getFallbackFeeRates } from '../api/bitcoin';
import { fetchRskGasPrice, getFallbackGasPrice } from '../api/rootstock';
import { calculateTotalCost, validatePegoutAmount } from '../lib/calculators/bridgeLogic';
import { btcToSats, formatBtc, isValidBtcAmount } from '../lib/utils';
import {
    RSK_GAS_POLL_INTERVAL,
    RSK_GAS_STALE_TIME,
    BTC_FEE_POLL_INTERVAL,
    BTC_FEE_STALE_TIME,
} from '../lib/constants';

// Direction of transfer
export type BridgeDirection = 'peg-in' | 'peg-out';

interface UseCrossLayerEstimateOptions {
    amount: string;      // BTC amount as string (e.g., "0.5")
    speed: FeeSpeed;
    direction?: BridgeDirection; // Added direction parameter
    bridgeType?: BridgeType;
    btcUsd?: number | null;
}

interface UseCrossLayerEstimateResult {
    data: FeeBreakdownResult | null;
    isLoading: boolean;
    isError: boolean;
    isStale: boolean; // Added isStale flag
    error: Error | null;
    refetch: () => void;
    validationError: string | null;
}

export function useCrossLayerEstimate({
    amount,
    speed,
    direction = 'peg-out',
    bridgeType = 'powpeg',
    btcUsd = null,
}: UseCrossLayerEstimateOptions): UseCrossLayerEstimateResult {
    const queryClient = useQueryClient();

    // ─── BTC Fee Rates Query ────────────────────────────────────
    const btcFeesQuery = useQuery({
        queryKey: ['btcFeeRates'],
        queryFn: fetchBitcoinFeeRates,
        refetchInterval: BTC_FEE_POLL_INTERVAL,
        staleTime: BTC_FEE_STALE_TIME,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        placeholderData: getFallbackFeeRates,
    });

    // ─── RSK Gas Price Query ────────────────────────────────────
    const rskGasQuery = useQuery({
        queryKey: ['rskGasPrice'],
        queryFn: fetchRskGasPrice,
        refetchInterval: RSK_GAS_POLL_INTERVAL,
        staleTime: RSK_GAS_STALE_TIME,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        placeholderData: getFallbackGasPrice,
    });

    // ─── Validation ─────────────────────────────────────────────
    const validationError = useMemo(() => {
        if (!amount || !isValidBtcAmount(amount)) return null; // No error if empty
        try {
            const sats = btcToSats(amount);
            const validation = validatePegoutAmount(sats);
            return validation.valid ? null : (validation.error ?? null);
        } catch (e: unknown) {
            return (e instanceof Error) ? e.message : 'Invalid amount';
        }
    }, [amount]);

    // ─── Compute Breakdown ──────────────────────────────────────
    const data = useMemo((): FeeBreakdownResult | null => {
        if (!isValidBtcAmount(amount)) return null;
        if (!btcFeesQuery.data || !rskGasQuery.data) return null;
        if (direction !== 'peg-out') return null; // Bridge currently only supports peg-out logic

        const amountSats = btcToSats(amount);
        const validation = validatePegoutAmount(amountSats);
        if (!validation.valid) return null;

        const result = calculateTotalCost({
            amountSats,
            speed,
            bridgeType,
            btcFeeRates: btcFeesQuery.data,
            rskGasPrice: rskGasQuery.data,
            btcUsd,
        });

        const totalFeeUsd = btcUsd
            ? (Number(result.totalFeeSats * 1000000n / 100000000n) / 1000000) * btcUsd
            : null;

        const netAmountUsd = btcUsd
            ? (Number(result.netAmountSats * 1000000n / 100000000n) / 1000000) * btcUsd
            : null;

        return {
            inputAmountSats: amountSats,
            inputAmountBtc: amount,
            speed,
            bridgeType,
            rskGas: result.rskGas,
            bridgeFee: result.bridgeFee,
            btcMinerFee: result.btcMinerFee,
            totalFeeSats: result.totalFeeSats,
            totalFeeBtc: formatBtc(result.totalFeeSats),
            totalFeeUsd,
            netAmountSats: result.netAmountSats,
            netAmountBtc: formatBtc(result.netAmountSats),
            netAmountUsd,
            feeDominance: result.feeDominance,
            btcFeeRate: result.btcFeeRate,
            rskGasPrice: rskGasQuery.data,
            estimatedVBytes: result.estimatedVBytes,
            timestamp: Date.now(),
        };
    }, [amount, speed, direction, bridgeType, btcFeesQuery.data, rskGasQuery.data, btcUsd]);

    const refetch = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['btcFeeRates'] });
        queryClient.invalidateQueries({ queryKey: ['rskGasPrice'] });
    }, [queryClient]);

    const normalizeError = (err: unknown): Error | null => {
        if (!err) return null;
        if (err instanceof Error) return err;
        return new Error(String(err));
    };

    return {
        data,
        isLoading: btcFeesQuery.isLoading || rskGasQuery.isLoading,
        isError: btcFeesQuery.isError || rskGasQuery.isError,
        isStale: btcFeesQuery.isStale || rskGasQuery.isStale,
        error: normalizeError(btcFeesQuery.error || rskGasQuery.error),
        refetch,
        validationError,
    };
}
