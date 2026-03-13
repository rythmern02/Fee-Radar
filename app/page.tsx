import { FeeBreakdown } from '@/src/components/FeeRadar/FeeBreakdown';
import { Radar, Github, ExternalLink } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Ambient Background ──────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/[0.03] blur-[120px]" />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/[0.03] blur-[120px]"
        />
        <div
          className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-amber-400/[0.02] blur-[100px]"
        />
      </div>

      {/* ─── Header ──────────────────────────────────────────── */}
      <header className="relative z-10 w-full border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Radar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-100">
                Fee-Radar
              </h1>
              <p className="text-[10px] text-zinc-500 -mt-0.5 uppercase tracking-widest">
                Cross-Layer Cost Estimator
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="https://dev.rootstock.io/concepts/powpeg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              Docs <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/rsksmart"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
            Know the{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              true cost
            </span>{' '}
            before you bridge
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Standard wallets only show the Rootstock gas fee. Fee-Radar breaks down
            every cost layer — L2 gas, bridge fees, and L1 miner fees — so you know
            exactly what you&apos;ll receive on Bitcoin.
          </p>
        </div>

        {/* The Widget */}
        <FeeBreakdown />

        {/* Info cards below the widget */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-lg w-full">
          <InfoCard
            emoji="⚡"
            title="Real-Time"
            description="Fees update every 30–60s from live APIs"
          />
          <InfoCard
            emoji="🔍"
            title="Transparent"
            description="See exactly where every satoshi goes"
          />
          <InfoCard
            emoji="🛡️"
            title="Safe"
            description="10% buffer to prevent underpayment"
          />
        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-600">
            Fee-Radar · Powered by{' '}
            <a
              href="https://mempool.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Mempool.space
            </a>
            {' '}&{' '}
            <a
              href="https://rootstock.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Rootstock
            </a>
          </p>
          <div className="flex items-center gap-3">
            <StatusIndicator />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function InfoCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/30 text-center hover:border-zinc-700/50 transition-all duration-300">
      <span className="text-xl">{emoji}</span>
      <h3 className="text-sm font-semibold text-zinc-200 mt-2">{title}</h3>
      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/** 
 * StatusIndicator is a Client Component to show real-time connectivity status 
 * without forcing the entire page to be a client component.
 */
function StatusIndicator() {
    return (
        <div className="flex items-center gap-3">
            <StatusDot label="Mempool API" queryKey="btcFeeRates" />
            <StatusDot label="RSK RPC" queryKey="rskGasPrice" />
        </div>
    );
}

import { StatusDot } from '@/src/components/FeeRadar/StatusDot';
