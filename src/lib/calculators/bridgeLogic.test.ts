import { describe, it, expect } from 'vitest';
import { calculateTotalCost, calculatePowPegFee, selectFeeRate, validatePegoutAmount } from './bridgeLogic';

describe('bridgeLogic', () => {
    describe('calculatePowPegFee', () => {
        it('should calculate 0.2% accurately', () => {
            expect(calculatePowPegFee(400_000n)).toBe(800n); // 0.004 BTC
            expect(calculatePowPegFee(100_000_000n)).toBe(200_000n); // 1 BTC
        });
    });

    describe('selectFeeRate', () => {
        const rates = {
            fastestFee: 50,
            halfHourFee: 25,
            hourFee: 10,
            economyFee: 5
        };

        it('should select correct speeds based on options', () => {
            expect(selectFeeRate(rates, 'high')).toBe(50);
            expect(selectFeeRate(rates, 'medium')).toBe(25);
            expect(selectFeeRate(rates, 'low')).toBe(5);
        });
    });

    describe('calculateTotalCost', () => {
        const defaultRates = { fastestFee: 50, halfHourFee: 25, hourFee: 10, economyFee: 5 };
        const defaultGasPrice = 60_000_000n; // 0.06 gwei

        it('should calculate standard fees without exceeding amount', () => {
            const amountSats = 100_000_000n; // 1 BTC
            const result = calculateTotalCost({
                amountSats,
                speed: 'medium',
                bridgeType: 'powpeg',
                btcFeeRates: defaultRates,
                rskGasPrice: defaultGasPrice,
                btcUsd: null
            });

            // 0.2% bridge fee of 1 BTC = 200_000 sats
            expect(result.bridgeFee.amountSats).toBe(200_000n);
            
            // BTC miner fee: 25 sats/vB * 297 vBytes = 7425 sats
            expect(result.btcMinerFee.amountSats).toBe(7425n);
            
            expect(result.feeExceedsAmount).toBe(false);
            expect(result.netAmountSats).toBeGreaterThan(0n);
            expect(result.totalFeeSats).toBeGreaterThan(0n); // Buffer applies here as well
        });

        it('should warn and set zero net amount if fees exceed transfer amount', () => {
            const amountSats = 400_000n; // 0.004 BTC test
            // Make BTC miner fees astronomically high
            const highRates = { fastestFee: 5000, halfHourFee: 5000, hourFee: 5000, economyFee: 5000 };
            const result = calculateTotalCost({
                amountSats,
                speed: 'medium',
                bridgeType: 'powpeg',
                btcFeeRates: highRates,
                rskGasPrice: defaultGasPrice,
                btcUsd: null
            });

            expect(result.feeExceedsAmount).toBe(true);
            expect(result.netAmountSats).toBe(0n);
        });
    });

    describe('validatePegoutAmount', () => {
         it('should validate minimum correct amount', () => {
             expect(validatePegoutAmount(400_000n).valid).toBe(true);
         });

         it('should enforce 0.004 minimum amount', () => {
             const result = validatePegoutAmount(399_999n);
             expect(result.valid).toBe(false);
             expect(result.error).toContain('Minimum peg-out');
         });

         it('should enforce 100 BTC maximum amount', () => {
             const result = validatePegoutAmount(101n * 100_000_000n);
             expect(result.valid).toBe(false);
         });
    });
});
