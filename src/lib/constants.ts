// ─── RSK Network ────────────────────────────────────────────────
export const RSK_MAINNET_RPC = 'https://public-node.rsk.co';
export const RSK_CHAIN_ID = 30;

// ─── PowPeg Bridge ──────────────────────────────────────────────
// RSK Bridge precompiled contract (native bridge)
export const POWPEG_BRIDGE_ADDRESS = '0x0000000000000000000000000000000001000006';

// Minimum peg-out: 0.004 BTC (400,000 sats)
export const MIN_PEGOUT_SATS = 400_000n;

// PowPeg fee: 0.2% of the peg-out amount
export const POWPEG_FEE_PERCENTAGE = 0.002;

// Flyover provider fee range
export const FLYOVER_FEE_MIN_PERCENTAGE = 0.001; // 0.1%
export const FLYOVER_FEE_MAX_PERCENTAGE = 0.003; // 0.3%
export const FLYOVER_FEE_DEFAULT_PERCENTAGE = 0.002; // 0.2%

// ─── Bitcoin Transaction Weight ─────────────────────────────────
// PowPeg release transaction characteristics:
// - Input: P2SH multisig (3-of-5 federation signers)
// - Output: P2PKH or P2WPKH to the user's BTC address
// - Change output back to the federation

// Typical PowPeg release tx (1 P2SH-multisig input, 2 outputs)
export const PEGOUT_TX_INPUTS = 1;
export const PEGOUT_TX_OUTPUTS = 2; // user output + change

// Legacy P2SH multisig input script sizes (3-of-5)
export const MULTISIG_SIGNATURES = 3;
export const MULTISIG_PUBKEYS = 5;
export const SIGNATURE_SIZE = 73; // DER-encoded avg
export const PUBKEY_SIZE = 34;    // compressed + push opcode

// Base transaction overhead
export const TX_VERSION_SIZE = 4;
export const TX_LOCKTIME_SIZE = 4;
export const TX_INPUT_COUNT_SIZE = 1;
export const TX_OUTPUT_COUNT_SIZE = 1;

// Per-input overhead (excluding scriptSig)
export const TX_INPUT_OUTPOINT_SIZE = 36; // txid(32) + vout(4)
export const TX_INPUT_SEQUENCE_SIZE = 4;
export const TX_INPUT_SCRIPTSIG_LENGTH_SIZE = 1;

// Per-output
export const TX_OUTPUT_VALUE_SIZE = 8;
export const TX_OUTPUT_SCRIPT_LENGTH_SIZE = 1;
export const TX_OUTPUT_P2PKH_SCRIPT_SIZE = 25;
export const TX_OUTPUT_P2WPKH_SCRIPT_SIZE = 22;

// ─── RSK Gas ────────────────────────────────────────────────────
// Gas limit for a peg-out (releaseBtc) operation on RSK
export const PEGOUT_GAS_LIMIT = 100_000n;

// Minimum gas price on RSK (0.06 gwei = 60 Mwei)
export const RSK_MIN_GAS_PRICE = 60_000_000n; // 0.06 gwei in wei

// ─── Fee Estimation Buffers ─────────────────────────────────────
export const FEE_BUFFER_PERCENTAGE = 0.1; // 10% safety buffer
export const FEE_DOMINANCE_THRESHOLD = 0.5; // 50% warning threshold

// ─── API Configuration ─────────────────────────────────────────
export const MEMPOOL_API_BASE = 'https://mempool.space/api';
export const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Polling intervals (milliseconds)
export const RSK_GAS_POLL_INTERVAL = 30_000;    // 30 seconds
export const BTC_FEE_POLL_INTERVAL = 60_000;    // 60 seconds
export const EXCHANGE_RATE_POLL_INTERVAL = 300_000; // 5 minutes

// Stale times
export const RSK_GAS_STALE_TIME = 30_000;       // 30 seconds
export const BTC_FEE_STALE_TIME = 60_000;       // 60 seconds
export const EXCHANGE_RATE_STALE_TIME = 300_000; // 5 minutes

// ─── Conversion Constants ───────────────────────────────────────
export const SATS_PER_BTC = 100_000_000n;
export const WEI_PER_RBTC = 1_000_000_000_000_000_000n;
export const GWEI_PER_WEI = 1_000_000_000n;
