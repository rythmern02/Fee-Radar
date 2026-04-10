/**
 * rootstock.ts — RSK RPC wrapper for gas price and bridge data.
 */

import { RSK_MAINNET_RPC, RSK_MIN_GAS_PRICE } from '../lib/constants';

/**
 * Fetch the current gas price from RSK mainnet.
 * Returns gas price in wei as bigint.
 *
 * CRITICAL-1 fix: Uses a single AbortController for the timeout.
 * The previous Promise.race layer was redundant dead code — both timers
 * fired at 10 s, creating a resource leak. Now only AbortController is used.
 */
export async function fetchRskGasPrice(): Promise<bigint> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
        const response = await fetch(RSK_MAINNET_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_gasPrice',
                params: [],
                id: 1,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`RSK RPC error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !data.result) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('RSK RPC returned invalid gasPrice, using minimum');
            }
            return RSK_MIN_GAS_PRICE;
        }

        // RSK gas price is returned in wei as a hex string
        const gasPrice = BigInt(data.result);

        // Ensure it's at least the minimum gas price
        return gasPrice > RSK_MIN_GAS_PRICE ? gasPrice : RSK_MIN_GAS_PRICE;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('RSK RPC request timed out after 10 seconds');
        }
        if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch RSK gas price:', error);
        }
        // Return a reasonable fallback (0.06 gwei — current RSK minimum)
        return RSK_MIN_GAS_PRICE;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Fallback gas price when the RPC is unreachable.
 */
export function getFallbackGasPrice(): bigint {
    return RSK_MIN_GAS_PRICE;
}
