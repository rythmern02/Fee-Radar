import { describe, it, expect } from 'vitest';
import { isValidFeeRate, getFallbackFeeRates, MAX_SANE_FEE_RATE } from './bitcoin';

describe('bitcoin', () => {
    describe('isValidFeeRate', () => {
        it('accepts positive finite numbers in range', () => {
            expect(isValidFeeRate(1)).toBe(true);
            expect(isValidFeeRate(25)).toBe(true);
            expect(isValidFeeRate(0.5)).toBe(true);
            expect(isValidFeeRate(MAX_SANE_FEE_RATE)).toBe(true);
        });

        it('rejects zero (must be strictly > 0)', () => {
            expect(isValidFeeRate(0)).toBe(false);
        });

        it('rejects negatives', () => {
            expect(isValidFeeRate(-1)).toBe(false);
            expect(isValidFeeRate(-0.001)).toBe(false);
            expect(isValidFeeRate(-MAX_SANE_FEE_RATE)).toBe(false);
        });

        it('rejects values above the sane upper bound', () => {
            expect(isValidFeeRate(MAX_SANE_FEE_RATE + 1)).toBe(false);
            expect(isValidFeeRate(100_000)).toBe(false);
            expect(isValidFeeRate(Number.MAX_VALUE)).toBe(false);
        });

        it('rejects NaN', () => {
            expect(isValidFeeRate(NaN)).toBe(false);
        });

        it('rejects Infinity and -Infinity', () => {
            expect(isValidFeeRate(Infinity)).toBe(false);
            expect(isValidFeeRate(-Infinity)).toBe(false);
        });

        it('rejects non-number inputs', () => {
            expect(isValidFeeRate('25')).toBe(false);
            expect(isValidFeeRate(null)).toBe(false);
            expect(isValidFeeRate(undefined)).toBe(false);
            expect(isValidFeeRate({})).toBe(false);
            expect(isValidFeeRate([])).toBe(false);
            expect(isValidFeeRate(true)).toBe(false);
        });
    });

    describe('getFallbackFeeRates', () => {
        it('returns the documented conservative defaults', () => {
            const r = getFallbackFeeRates();
            expect(r.fastestFee).toBe(50);
            expect(r.halfHourFee).toBe(25);
            expect(r.hourFee).toBe(10);
            expect(r.economyFee).toBe(5);
            expect(r.minimumFee).toBe(1);
        });

        it('all fallback rates pass isValidFeeRate', () => {
            const r = getFallbackFeeRates();
            expect(isValidFeeRate(r.fastestFee)).toBe(true);
            expect(isValidFeeRate(r.halfHourFee)).toBe(true);
            expect(isValidFeeRate(r.hourFee)).toBe(true);
            expect(isValidFeeRate(r.economyFee)).toBe(true);
            expect(isValidFeeRate(r.minimumFee)).toBe(true);
        });

        it('preserves monotonic ordering (fastest >= halfHour >= hour >= economy >= minimum)', () => {
            const r = getFallbackFeeRates();
            expect(r.fastestFee).toBeGreaterThanOrEqual(r.halfHourFee);
            expect(r.halfHourFee).toBeGreaterThanOrEqual(r.hourFee);
            expect(r.hourFee).toBeGreaterThanOrEqual(r.economyFee);
            expect(r.economyFee).toBeGreaterThanOrEqual(r.minimumFee);
        });
    });
});
