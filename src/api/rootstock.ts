/**
 * rootstock.ts — RSK RPC wrapper for gas price and bridge data.
 */

import { JsonRpcProvider } from 'ethers';
import { RSK_MAINNET_RPC, RSK_MIN_GAS_PRICE } from '../lib/constants';

let provider: JsonRpcProvider | null = null;

function getProvider(): JsonRpcProvider {
    if (!provider) {
        provider = new JsonRpcProvider(RSK_MAINNET_RPC, undefined, {
            staticNetwork: true,
            batchMaxCount: 1,
        });
    }
    return provider;
}

/**
 * Fetch the current gas price from RSK mainnet.
 * Returns gas price in wei as bigint.
 */
export async function fetchRskGasPrice(): Promise<bigint> {
    try {
        const rpc = getProvider();

        // Set a timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10_000);

        try {
            const feeData = await rpc.getFeeData();
            clearTimeout(timeoutId);

            if (feeData.gasPrice === null) {
                console.warn('RSK RPC returned null gasPrice, using minimum');
                return RSK_MIN_GAS_PRICE;
            }

            // RSK gas price is returned in wei
            const gasPrice = feeData.gasPrice;

            // Ensure it's at least the minimum gas price
            return gasPrice > RSK_MIN_GAS_PRICE ? gasPrice : RSK_MIN_GAS_PRICE;
        } catch {
            clearTimeout(timeoutId);
            throw new Error('RSK RPC request timed out or failed');
        }
    } catch (error) {
        console.error('Failed to fetch RSK gas price:', error);
        // Return a reasonable fallback (0.06 gwei — current RSK minimum)
        return RSK_MIN_GAS_PRICE;
    }
}

/**
 * Fallback gas price when the RPC is unreachable.
 */
export function getFallbackGasPrice(): bigint {
    return RSK_MIN_GAS_PRICE;
}
