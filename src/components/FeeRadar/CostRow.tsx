'use client';

import { memo } from 'react';
import { Cpu, Landmark, Bitcoin } from 'lucide-react';
import type { CostItem } from '../../types';
import { formatUsd, formatPercentage } from '../../lib/utils';
import { TooltipInfo } from './TooltipInfo';

type IconName = 'cpu' | 'landmark' | 'bitcoin';

interface CostRowProps {
    item: CostItem;
    iconName: IconName;
    tooltipTerm?: 'powpeg' | 'flyover' | 'btcMiner' | 'rskGas' | 'vbytes' | 'feeDominance';
    accentColor?: string;
    isHighlighted?: boolean;
}

const ICONS: Record<IconName, React.ReactNode> = {
    cpu: <Cpu className="h-4 w-4" />,
    landmark: <Landmark className="h-4 w-4" />,
    bitcoin: <Bitcoin className="h-4 w-4" />,
};

export const CostRow = memo(function CostRow({
    item,
    iconName,
    tooltipTerm,
    accentColor = 'bg-zinc-600',
    isHighlighted = false,
}: CostRowProps) {
    const icon = ICONS[iconName];

    return (
        <div
            className={`
        group flex items-center justify-between py-3.5 px-4 rounded-xl
        transition-all duration-200
        ${isHighlighted
                    ? 'bg-amber-500/5 border border-amber-500/10'
                    : 'hover:bg-zinc-800/40'
                }
      `}
        >
            {/* Left: Icon + Label + Tooltip */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={`
            flex-shrink-0 flex items-center justify-center
            h-8 w-8 rounded-lg
            bg-zinc-800/80 text-zinc-300
            group-hover:scale-105 transition-transform duration-200
          `}
                >
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-zinc-200 truncate">
                            {item.label}
                        </span>
                        {tooltipTerm && <TooltipInfo term={tooltipTerm} />}
                    </div>
                    {/* Percentage bar */}
                    <div className="flex items-center gap-2 mt-1">
                        <div className="max-w-[64px] w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${accentColor}`}
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                            {formatPercentage(item.percentage)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Amounts */}
            <div className="flex flex-col items-end gap-0.5 ml-4 flex-shrink-0">
                <span className="text-sm font-semibold text-zinc-100 font-mono tabular-nums">
                    {item.amountBtc} BTC
                </span>
                {item.amountUsd !== null && (
                    <span className="text-xs text-zinc-500 font-mono tabular-nums">
                        {formatUsd(item.amountUsd)}
                    </span>
                )}
            </div>
        </div>
    );
});
