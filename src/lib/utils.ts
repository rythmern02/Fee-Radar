import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SATS_PER_BTC, WEI_PER_RBTC } from './constants';

// ─── Tailwind className merge ───────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

// ─── Sats ↔ BTC ─────────────────────────────────────────────────
export function satsToBtc(sats: bigint): string {
    const whole = sats / SATS_PER_BTC;
    const remainder = sats % SATS_PER_BTC;
    const paddedRemainder = remainder.toString().padStart(8, '0');
    return `${whole}.${paddedRemainder}`;
}

export function btcToSats(btc: string): bigint {
    const parts = btc.split('.');
    const wholePart = parts[0] || '0';
    const fracPart = (parts[1] || '').padEnd(8, '0').slice(0, 8);
    return BigInt(wholePart) * SATS_PER_BTC + BigInt(fracPart);
}

// ─── Wei ↔ RBTC ─────────────────────────────────────────────────
export function weiToRbtc(wei: bigint): string {
    const whole = wei / WEI_PER_RBTC;
    const remainder = wei % WEI_PER_RBTC;
    const paddedRemainder = remainder.toString().padStart(18, '0');
    // Show 8 significant decimals
    return `${whole}.${paddedRemainder.slice(0, 8)}`;
}

export function weiToGwei(wei: bigint): string {
    const gwei = Number(wei) / 1e9;
    return gwei.toFixed(3);
}

// ─── Formatting ─────────────────────────────────────────────────
export function formatBtc(sats: bigint): string {
    const btc = satsToBtc(sats);
    // Remove trailing zeros but keep at least 4 decimals
    const [whole, frac] = btc.split('.');
    const trimmed = frac.replace(/0+$/, '').padEnd(4, '0');
    return `${whole}.${trimmed}`;
}

export function formatSats(sats: bigint): string {
    return Number(sats).toLocaleString('en-US');
}

export function formatUsd(amount: number): string {
    if (amount < 0.01) return '< $0.01';
    return `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function formatPercentage(value: number): string {
    if (value < 0.01) return '< 0.01%';
    return `${value.toFixed(2)}%`;
}

// ─── Validation ─────────────────────────────────────────────────
export function isValidBtcAmount(input: string): boolean {
    if (!input || input.trim() === '') return false;
    const num = Number(input);
    if (isNaN(num) || num <= 0) return false;
    // Check decimal places (max 8)
    const parts = input.split('.');
    if (parts[1] && parts[1].length > 8) return false;
    return true;
}

// ─── BigInt Helpers ─────────────────────────────────────────────
export function bigIntMax(a: bigint, b: bigint): bigint {
    return a > b ? a : b;
}

export function bigIntMin(a: bigint, b: bigint): bigint {
    return a < b ? a : b;
}

/** Apply a percentage to a bigint amount (e.g., 0.002 for 0.2%) */
export function applyPercentage(amount: bigint, percentage: number): bigint {
    // Multiply by 1e8 for precision, then divide
    const multiplier = BigInt(Math.round(percentage * 1e8));
    return (amount * multiplier) / 100_000_000n;
}
