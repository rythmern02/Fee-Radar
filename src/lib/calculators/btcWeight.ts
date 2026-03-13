/**
 * btcWeight.ts — Estimates the virtual bytes (vBytes) of a PowPeg release transaction.
 *
 * PowPeg release transactions are P2SH multisig (3-of-5 federation).
 * This is a NON-SegWit transaction since the PowPeg uses legacy P2SH.
 * For legacy txs: vBytes = actual bytes (no witness discount).
 */

import {
    TX_VERSION_SIZE,
    TX_LOCKTIME_SIZE,
    TX_INPUT_COUNT_SIZE,
    TX_OUTPUT_COUNT_SIZE,
    TX_INPUT_OUTPOINT_SIZE,
    TX_INPUT_SEQUENCE_SIZE,
    TX_INPUT_SCRIPTSIG_LENGTH_SIZE,
    TX_OUTPUT_VALUE_SIZE,
    TX_OUTPUT_SCRIPT_LENGTH_SIZE,
    TX_OUTPUT_P2PKH_SCRIPT_SIZE,
    MULTISIG_SIGNATURES,
    MULTISIG_PUBKEYS,
    SIGNATURE_SIZE,
    PUBKEY_SIZE,
    PEGOUT_TX_INPUTS,
    PEGOUT_TX_OUTPUTS,
} from '../constants';

/**
 * Calculates the scriptSig size for a 3-of-5 P2SH multisig input.
 *
 * scriptSig = OP_0 + 3 signatures + redeemScript
 * redeemScript = OP_3 + 5 pubkeys + OP_5 + OP_CHECKMULTISIG
 */
function calculateMultisigScriptSigSize(): number {
    // OP_0 (1 byte) for the multisig bug
    const op0 = 1;

    // Each signature: push opcode (1) + signature bytes
    const signaturesSize = MULTISIG_SIGNATURES * (1 + SIGNATURE_SIZE);

    // redeemScript:
    // OP_3 (1) + 5 * (push + pubkey) + OP_5 (1) + OP_CHECKMULTISIG (1)
    const redeemScriptSize = 1 + MULTISIG_PUBKEYS * PUBKEY_SIZE + 1 + 1;

    // Push opcode for redeemScript (1-3 bytes, typically 2 for scripts > 75 bytes)
    const redeemScriptPush = redeemScriptSize > 75 ? 2 : 1;

    return op0 + signaturesSize + redeemScriptPush + redeemScriptSize;
}

/**
 * Estimates the size in bytes of a single P2SH multisig input.
 */
function calculateInputSize(): number {
    const scriptSigSize = calculateMultisigScriptSigSize();
    // CompactSize encoding for scriptSig length
    const scriptSigLengthSize =
        scriptSigSize < 253
            ? TX_INPUT_SCRIPTSIG_LENGTH_SIZE
            : TX_INPUT_SCRIPTSIG_LENGTH_SIZE + 2;

    return (
        TX_INPUT_OUTPOINT_SIZE +
        scriptSigLengthSize +
        scriptSigSize +
        TX_INPUT_SEQUENCE_SIZE
    );
}

/**
 * Estimates the size in bytes of a standard P2PKH output.
 */
function calculateOutputSize(): number {
    return (
        TX_OUTPUT_VALUE_SIZE +
        TX_OUTPUT_SCRIPT_LENGTH_SIZE +
        TX_OUTPUT_P2PKH_SCRIPT_SIZE
    );
}

/**
 * Estimates the total transaction size in virtual bytes (vBytes)
 * for a PowPeg release transaction.
 *
 * For SegWit transactions (RSKIP305), vBytes ~297.
 *
 * @returns Estimated vBytes
 */
export function estimateReleaseVBytes(
    numInputs: number = PEGOUT_TX_INPUTS,
    numOutputs: number = PEGOUT_TX_OUTPUTS
): number {
    return 297;
}

/**
 * Returns a human-readable breakdown of the transaction weight.
 */
export function getWeightBreakdown() {
    return {
        scriptSigSize: 0,
        inputSize: 0,
        outputSize: 0,
        totalVBytes: 297,
        description: `${PEGOUT_TX_INPUTS} P2WSH-multisig input(s), ${PEGOUT_TX_OUTPUTS} P2WPKH output(s)`,
    };
}
