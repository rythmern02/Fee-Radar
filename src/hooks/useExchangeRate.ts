'use client';

/**
 * useExchangeRate — BTC/USD rate from CoinGecko public API.
 */

import { useQuery } from '@tanstack/react-query';
import { COINGECKO_API_BASE, EXCHANGE_RATE_POLL_INTERVAL, EXCHANGE_RATE_STALE_TIME } from '../lib/constants';

async function fetchBtcUsdRate(): Promise<number> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
        const response = await fetch(
            `${COINGECKO_API_BASE}/simple/price?ids=bitcoin&vs_currencies=usd`,
            {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
            }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        const price = data?.bitcoin?.usd;

        if (typeof price !== 'number' || price <= 0) {
            throw new Error('Invalid price data from CoinGecko');
        }

        return price;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('CoinGecko API request timed out');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

interface UseExchangeRateResult {
    btcUsd: number | null;
    isLoading: boolean;
    isError: boolean;
}

export function useExchangeRate(): UseExchangeRateResult {
    const query = useQuery({
        queryKey: ['btcUsdRate'],
        queryFn: fetchBtcUsdRate,
        refetchInterval: EXCHANGE_RATE_POLL_INTERVAL,
        staleTime: EXCHANGE_RATE_STALE_TIME,
        retry: 2,
        retryDelay: 5000,
    });

    return {
        btcUsd: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
