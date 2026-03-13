'use client';

import { memo } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface TooltipInfoProps {
    term: 'powpeg' | 'flyover' | 'btcMiner' | 'rskGas' | 'vbytes' | 'feeDominance';
}

const EXPLANATIONS: Record<string, { title: string; body: string }> = {
    powpeg: {
        title: 'PowPeg Bridge Fee',
        body: 'The PowPeg is Rootstock\'s native 2-way bridge secured by a federation of hardware security modules (HSMs). It charges a fixed 0.2% fee on peg-out amounts. Peg-outs typically take 16–40 hours due to Bitcoin confirmation requirements.',
    },
    flyover: {
        title: 'Flyover Bridge Fee',
        body: 'Flyover is a faster bridge protocol using liquidity providers (LPs). LPs front the BTC immediately and charge a variable fee (0.1–0.3%). Peg-outs are near-instant but cost slightly more.',
    },
    btcMiner: {
        title: 'Bitcoin Miner Fee',
        body: 'This is the fee paid to Bitcoin miners to include the release transaction in a block. It depends on the current network congestion (sats/vByte) and the transaction size (~297 vBytes for a PowPeg release).',
    },
    rskGas: {
        title: 'RSK Gas Fee',
        body: 'A small transaction fee on the Rootstock L2 network to initiate the peg-out smart contract call. RSK gas is typically very cheap compared to Bitcoin L1 fees.',
    },
    vbytes: {
        title: 'Virtual Bytes (vBytes)',
        body: 'A measure of transaction size that accounts for the SegWit witness discount. PowPeg release transactions are ~297 vBytes due to the 3-of-5 multisig input from the federation.',
    },
    feeDominance: {
        title: 'Fee Dominance',
        body: 'When one fee component makes up more than 50% of your total cost, we highlight it as "dominant." During high Bitcoin congestion, miner fees can dominate the total cost, especially for smaller peg-outs.',
    },
};

export const TooltipInfo = memo(function TooltipInfo({ term }: TooltipInfoProps) {
    const info = EXPLANATIONS[term];
    if (!info) return null;

    return (
        <Tooltip
            content={
                <div className="space-y-1.5">
                    <p className="font-semibold text-zinc-100">{info.title}</p>
                    <p className="text-zinc-300 leading-relaxed">{info.body}</p>
                </div>
            }
            side="top"
        >
            <Info className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300 transition-colors" />
        </Tooltip>
    );
});
