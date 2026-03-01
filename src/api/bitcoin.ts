/**
 * bitcoin.ts — Mempool.space API wrapper for Bitcoin fee rates.
 */

import type { BitcoinFeeRates } from '../types';
import { MEMPOOL_API_BASE } from '../lib/constants';

/**
 * Fetch current recommended fee rates from Mempool.space.
 *
 * Endpoint: GET /api/v1/fees/recommended
 * Returns: { fastestFee, halfHourFee, hourFee, economyFee, minimumFee } (sats/vByte)
 */
export async function fetchBitcoinFeeRates(): Promise<BitcoinFeeRates> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
        const response = await fetch(`${MEMPOOL_API_BASE}/v1/fees/recommended`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Mempool API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Validate response shape
        if (
            typeof data.fastestFee !== 'number' ||
            typeof data.halfHourFee !== 'number' ||
            typeof data.hourFee !== 'number'
        ) {
            throw new Error('Invalid fee rate response from Mempool API');
        }

        return {
            fastestFee: data.fastestFee,
            halfHourFee: data.halfHourFee,
            hourFee: data.hourFee,
            economyFee: data.economyFee ?? data.hourFee,
            minimumFee: data.minimumFee ?? 1,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('Mempool API request timed out after 10 seconds');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Fallback fee rates when the API is unreachable.
 * Conservative estimates to avoid undercharging.
 */
export function getFallbackFeeRates(): BitcoinFeeRates {
    return {
        fastestFee: 50,
        halfHourFee: 25,
        hourFee: 10,
        economyFee: 5,
        minimumFee: 1,
    };
}
