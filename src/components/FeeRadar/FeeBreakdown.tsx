'use client';

import { useState, useCallback, useDeferredValue } from 'react';
import {
    Zap,
    Clock,
    Hourglass,
    ArrowDownUp,
    AlertTriangle,
    RefreshCw,
    Landmark,
    Bitcoin,
    ChevronDown,
    Minus,
    ArrowRight,
} from 'lucide-react';
import type { FeeSpeed, BridgeType } from '../../types';
import { useCrossLayerEstimate } from '../../hooks/useCrossLayerEstimate';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SkeletonBreakdown } from '../ui/Skeleton';
import { CostRow } from './CostRow';
import { TooltipInfo } from './TooltipInfo';
import { formatBtc, formatUsd, isValidBtcAmount, weiToGwei } from '../../lib/utils';
import { MIN_PEGOUT_SATS } from '../../lib/constants';

const SPEED_OPTIONS: {
    value: FeeSpeed;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
}[] = [
        {
            value: 'low',
            label: 'Economy',
            sublabel: '~60 min',
            icon: <Hourglass className="h-3.5 w-3.5" />,
        },
        {
            value: 'medium',
            label: 'Standard',
            sublabel: '~30 min',
            icon: <Clock className="h-3.5 w-3.5" />,
        },
        {
            value: 'high',
            label: 'Priority',
            sublabel: '~10 min',
            icon: <Zap className="h-3.5 w-3.5" />,
        },
    ];

const BRIDGE_OPTIONS: { value: BridgeType; label: string }[] = [
    { value: 'powpeg', label: 'PowPeg' },
    { value: 'flyover', label: 'Flyover' },
];

export function FeeBreakdown() {
    const [amount, setAmount] = useState('0.5');
    const deferredAmount = useDeferredValue(amount);
    const [speed, setSpeed] = useState<FeeSpeed>('medium');
    const [bridgeType, setBridgeType] = useState<BridgeType>('powpeg');
    const [showBridgeSelector, setShowBridgeSelector] = useState(false);

    const { btcUsd } = useExchangeRate();
    const { data, isLoading, isError, isStale, error, refetch, validationError } =
        useCrossLayerEstimate({ amount: deferredAmount, speed, bridgeType, btcUsd });

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow empty, numbers, and decimals
        if (val === '' || /^\d*\.?\d{0,8}$/.test(val)) {
            setAmount(val);
        }
    }, []);

    const inputAmountUsd =
        btcUsd && isValidBtcAmount(amount)
            ? formatUsd(parseFloat(amount) * btcUsd)
            : null;

    return (
        <Card variant="glass" className="w-full max-w-lg animate-slide-up">
            {/* ─── Header ──────────────────────────────────────────── */}
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <ArrowDownUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Peg-Out Cost Estimator</CardTitle>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Rootstock → Bitcoin
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isStale && (
                            <Badge variant="default" className="text-[10px] text-zinc-500 border-zinc-800">
                                Stale Data
                            </Badge>
                        )}
                        <button
                            onClick={refetch}
                            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-200"
                            title="Refresh fees"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-0">
                {/* ─── Amount Input ────────────────────────────────────── */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Amount to Transfer
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.00"
                            className={`
                w-full h-14 pl-4 pr-20 rounded-xl
                bg-zinc-800/50 border text-lg font-mono text-zinc-100
                placeholder:text-zinc-600
                focus:outline-none focus:ring-2 transition-all duration-200
                ${validationError
                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                    : 'border-zinc-700/50 focus:ring-amber-500/30 focus:border-amber-500/50'
                                }
              `}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <Bitcoin className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-semibold text-zinc-300">BTC</span>
                        </div>
                    </div>
                    {/* USD equivalent */}
                    {inputAmountUsd && (
                        <p className="text-xs text-zinc-500 pl-1 animate-fade-in">
                            ≈ {inputAmountUsd}
                        </p>
                    )}
                    {/* Validation error */}
                    {validationError && (
                        <p className="text-xs text-red-400 pl-1 flex items-center gap-1 animate-fade-in">
                            <AlertTriangle className="h-3 w-3" />
                            {validationError}
                        </p>
                    )}
                </div>

                {/* ─── Speed Selector ──────────────────────────────────── */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Bitcoin Confirmation Speed
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {SPEED_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSpeed(option.value)}
                                className={`
                                  flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl
                                  border text-center transition-all duration-200
                                  ${speed === option.value
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5'
                                        : 'bg-zinc-800/30 border-zinc-700/30 text-zinc-400 hover:bg-zinc-800/50 hover:border-zinc-600/50'
                                    }
                                `}
                            >
                                {option.icon}
                                <span className="text-xs font-semibold">{option.label}</span>
                                <span className="text-[10px] opacity-70">{option.sublabel}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Bridge Type Selector ────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-500">Bridge:</span>
                        <button
                            onClick={() => setShowBridgeSelector(!showBridgeSelector)}
                            className="flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
                        >
                            {bridgeType === 'powpeg' ? 'PowPeg' : 'Flyover'}
                            <ChevronDown className={`h-3 w-3 transition-transform ${showBridgeSelector ? 'rotate-180' : ''}`} />
                        </button>
                        <TooltipInfo term={bridgeType} />
                    </div>
                    {data && (
                        <Badge variant="info" className="text-[10px]">
                            {data.btcFeeRate} sats/vB · {data.estimatedVBytes} vB
                        </Badge>
                    )}
                </div>

                {showBridgeSelector && (
                    <div className="flex gap-2 animate-fade-in">
                        {BRIDGE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setBridgeType(opt.value);
                                    setShowBridgeSelector(false);
                                }}
                                className={`
                                  flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                                  ${bridgeType === opt.value
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                        : 'bg-zinc-800/30 border-zinc-700/30 text-zinc-400 hover:bg-zinc-800/50'
                                    }
                                `}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ─── Fee Breakdown ───────────────────────────────────── */}
                <div className="border-t border-zinc-800/50 pt-4">
                    {isLoading && !data ? (
                        <SkeletonBreakdown />
                    ) : isError ? (
                        <div className="text-center py-6 space-y-3">
                            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-300">
                                    Failed to fetch fees
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {error?.message || 'Network error'}
                                </p>
                            </div>
                            <button
                                onClick={refetch}
                                className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : data ? (
                        <div className="space-y-1 animate-fade-in">
                            {/* RSK Gas */}
                            <CostRow
                                item={data.rskGas}
                                iconName="cpu"
                                tooltipTerm="rskGas"
                                accentColor="bg-emerald-500"
                            />

                            {/* Bridge Fee */}
                            <CostRow
                                item={data.bridgeFee}
                                iconName="landmark"
                                tooltipTerm={data.bridgeType === 'powpeg' ? 'powpeg' : 'flyover'}
                                accentColor="bg-blue-500"
                            />

                            {/* BTC Miner Fee */}
                            <CostRow
                                item={data.btcMinerFee}
                                iconName="bitcoin"
                                tooltipTerm="btcMiner"
                                accentColor="bg-amber-500"
                                isHighlighted={data.feeDominance.isWarning && data.feeDominance.dominantFee === 'Bitcoin Miner Fee'}
                            />

                            {/* Fee Dominance Warning */}
                            {data.feeDominance.isWarning && (
                                <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 animate-fade-in">
                                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-300/80 leading-relaxed">
                                        <span className="font-semibold text-amber-300">
                                            {data.feeDominance.dominantFee}
                                        </span>{' '}
                                        makes up{' '}
                                        <span className="font-mono font-semibold text-amber-300">
                                            {data.feeDominance.percentage.toFixed(0)}%
                                        </span>{' '}
                                        of your total cost.
                                        <span className="flex items-center gap-1 mt-0.5">
                                            Consider waiting for lower fees.
                                            <TooltipInfo term="feeDominance" />
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* ─── Divider ──────────────────────────────────── */}
                            <div className="border-t border-zinc-800/50 my-3" />

                            {/* ─── Totals ───────────────────────────────────── */}
                            <div className="space-y-3 px-4">
                                {/* Total Fee */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Minus className="h-3.5 w-3.5 text-red-400" />
                                        <span className="text-sm text-zinc-400">Total Fees</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-red-400 font-mono tabular-nums">
                                            −{data.totalFeeBtc} BTC
                                        </span>
                                        {data.totalFeeUsd !== null && (
                                            <p className="text-xs text-zinc-500 font-mono tabular-nums">
                                                {formatUsd(data.totalFeeUsd)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Net Amount */}
                                <div className={`
                                  flex items-center justify-between p-3 -mx-3 rounded-xl border transition-all
                                  ${data.netAmountSats === 0n 
                                    ? 'bg-red-500/5 border-red-500/10' 
                                    : 'bg-emerald-500/5 border-emerald-500/10'}
                                `}>
                                    <div className="flex items-center gap-2">
                                        <ArrowRight className={`h-4 w-4 ${data.netAmountSats === 0n ? 'text-red-400' : 'text-emerald-400'}`} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-200">
                                                You Receive
                                            </span>
                                            {data.netAmountSats === 0n && (
                                                <span className="text-[10px] text-red-400 font-medium">Fees exceed amount</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-lg font-bold font-mono tabular-nums ${data.netAmountSats === 0n ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {data.netAmountBtc} BTC
                                        </span>
                                        {data.netAmountUsd !== null && (
                                            <p className="text-xs text-zinc-400 font-mono tabular-nums">
                                                ≈ {formatUsd(data.netAmountUsd)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ─── Cost Distribution Bar ────────────────────── */}
                            <div className="mt-4 px-4">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                                    Cost Distribution
                                </p>
                                <div className="h-2 rounded-full overflow-hidden flex bg-zinc-800">
                                    <div
                                        className="bg-emerald-500 transition-all duration-700"
                                        style={{ width: `${data.rskGas.percentage}%` }}
                                        title={`RSK Gas: ${data.rskGas.percentage.toFixed(1)}%`}
                                    />
                                    <div
                                        className="bg-blue-500 transition-all duration-700"
                                        style={{ width: `${data.bridgeFee.percentage}%` }}
                                        title={`Bridge: ${data.bridgeFee.percentage.toFixed(1)}%`}
                                    />
                                    <div
                                        className="bg-amber-500 transition-all duration-700"
                                        style={{ width: `${data.btcMinerFee.percentage}%` }}
                                        title={`BTC Miner: ${data.btcMinerFee.percentage.toFixed(1)}%`}
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-zinc-500">RSK Gas</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-[10px] text-zinc-500">Bridge</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span className="text-[10px] text-zinc-500">BTC Miner</span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Metadata ─────────────────────────────────── */}
                            <div className="mt-4 pt-3 border-t border-zinc-800/30 px-4">
                                <div className="flex items-center justify-between text-[10px] text-zinc-600">
                                    <span>
                                        RSK Gas: {weiToGwei(data.rskGasPrice)} gwei
                                    </span>
                                    <span suppressHydrationWarning>
                                        Updated {new Date(data.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="text-center py-8 space-y-2">
                            <p className="text-sm text-zinc-400">
                                Enter an amount above to see the fee breakdown
                            </p>
                            <p className="text-xs text-zinc-600">
                                Minimum: {formatBtc(MIN_PEGOUT_SATS)} BTC
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
