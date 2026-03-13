import { describe, it, expect } from 'vitest';
import { estimateReleaseVBytes } from './btcWeight';

describe('btcWeight', () => {
    describe('estimateReleaseVBytes', () => {
        it('should return 297 vBytes for a standard PowPeg release transaction', () => {
            expect(estimateReleaseVBytes()).toBe(297);
        });
    });
});
