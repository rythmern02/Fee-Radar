// ─── Fee Speed ──────────────────────────────────────────────────
export type FeeSpeed = 'low' | 'medium' | 'high';

// ─── Bitcoin Fee Rates (from Mempool.space) ─────────────────────
export interface BitcoinFeeRates {
    fastestFee: number;    // sats/vByte
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
}

// ─── Bridge Type ────────────────────────────────────────────────
export type BridgeType = 'powpeg' | 'flyover';

// ─── Individual Cost Item ───────────────────────────────────────
export interface CostItem {
    label: string;
    description: string;
    amountSats: bigint;
    amountBtc: string;
    amountUsd: number | null;
    percentage: number; // % of total cost
}

// ─── Fee Dominance Warning ──────────────────────────────────────
export interface FeeDominance {
    dominantFee: string;
    percentage: number;
    isWarning: boolean; // true if > 50% of total cost
}

// ─── Full Fee Breakdown Result ──────────────────────────────────
export interface FeeBreakdownResult {
    // Input
    inputAmountSats: bigint;
    inputAmountBtc: string;
    speed: FeeSpeed;
    bridgeType: BridgeType;

    // Individual costs
    rskGas: CostItem;
    bridgeFee: CostItem;
    btcMinerFee: CostItem;

    // Totals
    totalFeeSats: bigint;
    totalFeeBtc: string;
    totalFeeUsd: number | null;

    // Net amount after all fees
    netAmountSats: bigint;
    netAmountBtc: string;
    netAmountUsd: number | null;

    // Analysis
    feeDominance: FeeDominance;

    // Metadata
    btcFeeRate: number;        // sats/vByte used
    rskGasPrice: bigint;       // wei
    estimatedVBytes: number;
    timestamp: number;
}

// ─── Exchange Rate ──────────────────────────────────────────────
export interface ExchangeRateData {
    btcUsd: number;
    lastUpdated: number;
}

// ─── API Error ──────────────────────────────────────────────────
export interface ApiError {
    source: 'mempool' | 'rsk' | 'coingecko';
    message: string;
    retryable: boolean;
}
