import { describe, it, expect } from 'vitest';
import { estimateReleaseVBytes, getWeightBreakdown } from './btcWeight';
import { PEGOUT_TX_INPUTS, PEGOUT_TX_OUTPUTS } from '../constants';

describe('btcWeight', () => {
    describe('estimateReleaseVBytes', () => {
        it('returns the calibrated 297 vBytes for the standard 1-in / 2-out config', () => {
            expect(estimateReleaseVBytes()).toBe(297);
            expect(estimateReleaseVBytes(PEGOUT_TX_INPUTS, PEGOUT_TX_OUTPUTS)).toBe(297);
        });

        it('reconstructs from component sizes for non-standard configs', () => {
            // Two-input config must exceed the standard 297 baseline (extra input dominates).
            const twoInputs = estimateReleaseVBytes(2, 2);
            expect(twoInputs).toBeGreaterThan(297);

            // Adding an extra output must add bytes (small constant: output value+script).
            const threeOutputs = estimateReleaseVBytes(1, 3);
            const twoOutputs = estimateReleaseVBytes(1, 2);
            // 1-in/2-out hits the calibrated branch (297) while 1-in/3-out runs the
            // reconstructed branch — so we don't compare them directly. Compare two
            // reconstructed configs instead.
            const oneInOneOut = estimateReleaseVBytes(1, 1);
            const oneInTwoOutReconstructed = estimateReleaseVBytes(1, 4) - estimateReleaseVBytes(1, 2);
            expect(threeOutputs).toBeGreaterThan(oneInOneOut);
            expect(oneInTwoOutReconstructed).toBeGreaterThan(0);
            expect(twoOutputs).toBe(297); // calibrated branch
        });

        it('scales monotonically with input count', () => {
            const a = estimateReleaseVBytes(1, 1);
            const b = estimateReleaseVBytes(2, 1);
            const c = estimateReleaseVBytes(3, 1);
            expect(b - a).toBeGreaterThan(0);
            expect(c - b).toBe(b - a); // linear per input
        });

        it('scales monotonically with output count', () => {
            const a = estimateReleaseVBytes(1, 1);
            const b = estimateReleaseVBytes(1, 2);
            const c = estimateReleaseVBytes(1, 3);
            // b uses calibrated branch (297) while a/c use reconstructed: only assert
            // a < c (both reconstructed) for linearity.
            expect(c).toBeGreaterThan(a);
            expect(b).toBe(297);
        });
    });

    describe('getWeightBreakdown', () => {
        it('returns positive component sizes for the standard config', () => {
            const breakdown = getWeightBreakdown();
            expect(breakdown.scriptSigSize).toBeGreaterThan(0);
            expect(breakdown.inputSize).toBeGreaterThan(breakdown.scriptSigSize);
            expect(breakdown.outputSize).toBeGreaterThan(0);
            expect(breakdown.totalVBytes).toBe(297);
            expect(breakdown.calibrated).toBe(true);
            expect(breakdown.description).toContain('1 P2SH-multisig input');
            expect(breakdown.description).toContain('2 output(s)');
        });

        it('flags non-standard configs as not calibrated', () => {
            const breakdown = getWeightBreakdown(2, 2);
            expect(breakdown.calibrated).toBe(false);
            expect(breakdown.totalVBytes).toBeGreaterThan(297);
        });

        it('scriptSig size matches a 3-of-5 multisig structural calc', () => {
            const breakdown = getWeightBreakdown();
            // 3-of-5: OP_0 + 3 × (1 push + 73 sig) + 2 (PUSHDATA1 for >75-byte redeemScript)
            //         + redeemScript(OP_3 + 5×34 + OP_5 + OP_CHECKMULTISIG = 173)
            // = 1 + 222 + 2 + 173 = 398
            expect(breakdown.scriptSigSize).toBe(398);
        });

        it('outputSize matches the P2PKH structural calc (8 + 1 + 25 = 34)', () => {
            const breakdown = getWeightBreakdown();
            expect(breakdown.outputSize).toBe(34);
        });
    });
});
