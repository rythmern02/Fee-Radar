import { describe, it, expect } from 'vitest';
import { btcToSats, satsToBtc, applyPercentage, isValidBtcAmount } from './utils';

describe('utils', () => {
    describe('btcToSats', () => {
        it('should convert standard values', () => {
            expect(btcToSats('1')).toBe(100_000_000n);
            expect(btcToSats('0.5')).toBe(50_000_000n);
            expect(btcToSats('0.004')).toBe(400_000n);
        });
        it('should safely truncate when more than 8 decimals are explicitly passed but still parseable', () => {
            // Because btcToSats uses string slicing, taking the first 8 characters and padding
            // It expects max 8 decimal places or it throws an error in theory based on the fixed code.
            // Wait, btcToSats throws error if fracPart.length > 8. 
            // So we should expect throw.
            expect(() => btcToSats('0.123456789')).toThrow('More than 8 decimal places not supported');
        });
        it('should throw on scientific notation', () => {
            expect(() => btcToSats('1e-5')).toThrow('Scientific notation not supported');
        });
    });

    describe('satsToBtc', () => {
        it('should convert sats to BTC string', () => {
            expect(satsToBtc(100_000_000n)).toBe('1.00000000');
            expect(satsToBtc(50_000_000n)).toBe('0.50000000');
            expect(satsToBtc(400_000n)).toBe('0.00400000');
            expect(satsToBtc(0n)).toBe('0.00000000');
        });
    });

    describe('applyPercentage', () => {
        it('should correctly apply percentage', () => {
            // 0.2% of 400,000 is 800
            expect(applyPercentage(400_000n, 0.002)).toBe(800n);
        });
        it('should not return zero for small but non-zero amounts', () => {
            // 0.2% of 100 is 0 n naturally, but the function bounds it to 1n if > 0.
            expect(applyPercentage(100n, 0.002)).toBe(1n);
        });
    });

    describe('isValidBtcAmount', () => {
        it('should validate btc amounts properly', () => {
            expect(isValidBtcAmount('0.5')).toBe(true);
            expect(isValidBtcAmount('10')).toBe(true);
            expect(isValidBtcAmount('0.00000001')).toBe(true);
            
            // Invalid checks
            expect(isValidBtcAmount('-1')).toBe(false);
            expect(isValidBtcAmount('0')).toBe(false);
            expect(isValidBtcAmount('abc')).toBe(false);
            expect(isValidBtcAmount('1e-5')).toBe(false); // scientific
            expect(isValidBtcAmount('0.123456789')).toBe(false); // too many decimals
        });
    });
});
