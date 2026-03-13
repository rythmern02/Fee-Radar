/**
 * bridgeLogic.ts — Pure math for PowPeg/Flyover fee calculations.
 * No React, no side effects. All amounts in satoshis (bigint).
 */

import type { BridgeType, CostItem, FeeDominance, FeeSpeed } from '../../types';
import {
    POWPEG_FEE_PERCENTAGE,
    FLYOVER_FEE_DEFAULT_PERCENTAGE,
    PEGOUT_GAS_LIMIT,
    FEE_BUFFER_PERCENTAGE,
    FEE_DOMINANCE_THRESHOLD,
    MIN_PEGOUT_SATS,
    SATS_PER_BTC,
} from '../constants';
import { applyPercentage, formatBtc } from '../utils';
import { estimateReleaseVBytes } from './btcWeight';

// ─── Individual Fee Calculators ─────────────────────────────────

/** PowPeg bridge fee: 0.2% of the peg-out amount */
export function calculatePowPegFee(amountSats: bigint): bigint {
    return applyPercentage(amountSats, POWPEG_FEE_PERCENTAGE);
}

/** Flyover provider fee: ~0.2% (variable per provider) */
export function calculateFlyoverFee(
    amountSats: bigint,
    providerFeePercentage: number = FLYOVER_FEE_DEFAULT_PERCENTAGE
): bigint {
    return applyPercentage(amountSats, providerFeePercentage);
}

/** Bitcoin miner fee: feeRate (sats/vByte) × estimated vBytes */
export function calculateBtcMinerFee(feeRate: number, vBytes?: number): bigint {
    const txVBytes = vBytes ?? estimateReleaseVBytes();
    const feeSats = Math.ceil(feeRate * txVBytes);
    return BigInt(feeSats);
}

/** RSK gas cost in satoshis (1 RBTC = 1 BTC = 1e8 sats) */
export function calculateRskGasCost(gasPrice: bigint, gasLimit: bigint = PEGOUT_GAS_LIMIT): bigint {
    const weiCost = gasPrice * gasLimit;
    // Convert wei to sats: 1 RBTC = 1e18 wei = 1e8 sats
    // So 1 sat = 1e10 wei
    const satsCost = weiCost / 10_000_000_000n;
    return satsCost;
}

// ─── Fee Rate Selection ─────────────────────────────────────────

export interface BitcoinFeeRatesInput {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
}

export function selectFeeRate(rates: BitcoinFeeRatesInput, speed: FeeSpeed): number {
    switch (speed) {
        case 'high':
            return rates.fastestFee;
        case 'medium':
            return rates.halfHourFee;
        case 'low':
            return rates.economyFee;
        default:
            return rates.halfHourFee;
    }
}

export function getSpeedLabel(speed: FeeSpeed): string {
    switch (speed) {
        case 'high':
            return 'Priority (~10 min)';
        case 'medium':
            return 'Standard (~30 min)';
        case 'low':
            return 'Economy (~60 min)';
    }
}

// ─── Complete Breakdown ─────────────────────────────────────────

export interface CalculateTotalCostParams {
    amountSats: bigint;
    speed: FeeSpeed;
    bridgeType: BridgeType;
    btcFeeRates: BitcoinFeeRatesInput;
    rskGasPrice: bigint;
    btcUsd: number | null;
    flyoverFeePercentage?: number;
}

export interface TotalCostResult {
    rskGas: CostItem;
    bridgeFee: CostItem;
    btcMinerFee: CostItem;
    totalFeeSats: bigint;
    netAmountSats: bigint;
    feeExceedsAmount: boolean;
    feeDominance: FeeDominance;
    btcFeeRate: number;
    estimatedVBytes: number;
}

function satsToUsd(sats: bigint, btcUsd: number | null): number | null {
    if (btcUsd === null) return null;
    return (Number(sats) / Number(SATS_PER_BTC)) * btcUsd;
}

export function calculateTotalCost(params: CalculateTotalCostParams): TotalCostResult {
    const { amountSats, speed, bridgeType, btcFeeRates, rskGasPrice, btcUsd, flyoverFeePercentage } = params;

    // 1. RSK Gas
    const rskGasSats = calculateRskGasCost(rskGasPrice);

    // 2. Bridge fee
    const bridgeFeeSats =
        bridgeType === 'powpeg'
            ? calculatePowPegFee(amountSats)
            : calculateFlyoverFee(amountSats, flyoverFeePercentage);

    // 3. BTC Miner fee
    const feeRate = selectFeeRate(btcFeeRates, speed);
    const vBytes = estimateReleaseVBytes();
    const btcMinerFeeSats = calculateBtcMinerFee(feeRate, vBytes);

    // 4. Total fees
    const totalFeeSats = rskGasSats + bridgeFeeSats + btcMinerFeeSats;

    // 5. Apply buffer
    const bufferedTotal = totalFeeSats + applyPercentage(totalFeeSats, FEE_BUFFER_PERCENTAGE);

    // 6. Net amount Check
    const feeExceedsAmount = bufferedTotal >= amountSats;
    const netAmountSats = feeExceedsAmount ? 0n : amountSats - bufferedTotal;

    // 7. Fee percentages
    const totalFeeNum = Number(totalFeeSats);
    const rskPct = totalFeeNum > 0 ? (Number(rskGasSats) / totalFeeNum) * 100 : 0;
    const bridgePct = totalFeeNum > 0 ? (Number(bridgeFeeSats) / totalFeeNum) * 100 : 0;
    const btcPct = totalFeeNum > 0 ? (Number(btcMinerFeeSats) / totalFeeNum) * 100 : 0;

    // 8. Fee dominance
    const fees = [
        { name: 'Bitcoin Miner Fee', pct: btcPct },
        { name: 'Bridge Fee', pct: bridgePct },
        { name: 'RSK Gas', pct: rskPct },
    ];
    const dominant = fees.reduce((a, b) => (a.pct > b.pct ? a : b));

    return {
        rskGas: {
            label: 'RSK Gas (L2)',
            description: 'Transaction fee on Rootstock to initiate the peg-out',
            amountSats: rskGasSats,
            amountBtc: formatBtc(rskGasSats),
            amountUsd: satsToUsd(rskGasSats, btcUsd),
            percentage: rskPct,
        },
        bridgeFee: {
            label: bridgeType === 'powpeg' ? 'PowPeg Bridge Fee' : 'Flyover Bridge Fee',
            description:
                bridgeType === 'powpeg'
                    ? 'Fixed 0.2% fee charged by the PowPeg federation for processing the peg-out'
                    : 'Variable fee charged by the Flyover liquidity provider (~0.1–0.3%)',
            amountSats: bridgeFeeSats,
            amountBtc: formatBtc(bridgeFeeSats),
            amountUsd: satsToUsd(bridgeFeeSats, btcUsd),
            percentage: bridgePct,
        },
        btcMinerFee: {
            label: 'Bitcoin Miner Fee (L1)',
            description: `Network fee for the Bitcoin release transaction (${feeRate} sats/vB × ${vBytes} vB)`,
            amountSats: btcMinerFeeSats,
            amountBtc: formatBtc(btcMinerFeeSats),
            amountUsd: satsToUsd(btcMinerFeeSats, btcUsd),
            percentage: btcPct,
        },
        totalFeeSats: bufferedTotal,
        netAmountSats,
        feeExceedsAmount,
        feeDominance: {
            dominantFee: dominant.name,
            percentage: dominant.pct,
            isWarning: dominant.pct / 100 > FEE_DOMINANCE_THRESHOLD,
        },
        btcFeeRate: feeRate,
        estimatedVBytes: vBytes,
    };
}

// ─── Validation ─────────────────────────────────────────────────

export function validatePegoutAmount(amountSats: bigint): {
    valid: boolean;
    error?: string;
} {
    if (amountSats <= 0n) {
        return { valid: false, error: 'Amount must be greater than 0' };
    }
    if (amountSats < MIN_PEGOUT_SATS) {
        return {
            valid: false,
            error: `Minimum peg-out is 0.004 BTC (${MIN_PEGOUT_SATS.toString()} sats)`,
        };
    }
    if (amountSats > 100n * SATS_PER_BTC) {
        return {
            valid: false,
            error: 'Amount exceeds maximum allowed peg-out size (100 BTC)'
        };
    }
    return { valid: true };
}
