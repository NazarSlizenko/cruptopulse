import { ArrowDownRight, ArrowUpRight, Minus, Zap } from 'lucide-react';
import { useState } from 'react';
import type { CoinMarketState, SentimentType } from '../types/crypto';
import { AnimatedImpactMeter, getSentimentLabel } from './AnimatedImpactMeter';

interface CoinImpactGridProps {
  coins: CoinMarketState[];
  selectedCoin: string | null;
  onSelectCoin: (symbol: string | null) => void;
  loading?: boolean;
}

type CoinSortMode = 'impact' | 'change' | 'cap';

export function formatPriceUsd(price: number): string {
  if (!price || price <= 0) return '—';
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 5 })}`;
}

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  if (!points || points.length < 2) {
    return <div className="h-7 w-20 border-b border-dashed border-slate-800" aria-hidden="true" />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 84;
  const height = 28;

  const d = points
    .map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible shrink-0" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke={positive ? '#34d399' : '#fb7185'}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SentimentIcon({ sentiment }: { sentiment: SentimentType }) {
  if (sentiment === 'bullish') return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  if (sentiment === 'bearish') return <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
}

export function CoinImpactGrid({ coins, selectedCoin, onSelectCoin, loading }: CoinImpactGridProps) {
  const [sortBy, setSortBy] = useState<CoinSortMode>('impact');

  const sortedCoins = [...coins].sort((a, b) => {
    if (sortBy === 'impact') {
      if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
      return Math.abs(b.newsReactionPct) - Math.abs(a.newsReactionPct);
    }
    if (sortBy === 'change') {
      return Math.abs(b.change24hPct) - Math.abs(a.change24hPct);
    }
    return b.marketCapUsd - a.marketCapUsd;
  });

  return (
    <section id="coins" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Карта влияния новостей на криптовалюты
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Индекс силы влияния новостей (0–100), актуальная цена и расчетная реакция котировок по {coins.length || 14} монетам.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSortBy('impact')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sortBy === 'impact'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            По влиянию 0–100
          </button>
          <button
            type="button"
            onClick={() => setSortBy('change')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sortBy === 'change'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            По волатильности 24ч
          </button>
          <button
            type="button"
            onClick={() => setSortBy('cap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sortBy === 'cap'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            По капитализации
          </button>
        </div>
      </div>

      {loading && coins.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-xl bg-[#111827] border border-slate-800/80 animate-pulse p-5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedCoins.map((coin) => {
            const isSelected = selectedCoin === coin.symbol;
            const is24hUp = coin.change24hPct >= 0;
            const isReactionUp = coin.newsReactionPct > 0;
            const isReactionDown = coin.newsReactionPct < 0;

            const sentimentColor =
              coin.sentiment === 'bullish'
                ? 'text-emerald-400'
                : coin.sentiment === 'bearish'
                ? 'text-rose-400'
                : 'text-slate-400';

            const reactionColor = isReactionUp
              ? 'text-emerald-400'
              : isReactionDown
              ? 'text-rose-400'
              : 'text-slate-300';

            return (
              <button
                key={coin.symbol}
                type="button"
                onClick={() => onSelectCoin(isSelected ? null : coin.symbol)}
                className={`text-left w-full rounded-xl p-5 transition-colors border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  isSelected
                    ? 'bg-[#162032] border-sky-500/70'
                    : 'bg-[#111827] border-slate-800 hover:border-slate-700 hover:bg-[#131C2D]'
                }`}
              >
                {/* Header Row: Ticker + Price */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-slate-100 tracking-tight">
                        {coin.symbol}
                      </span>
                      <span className="text-xs text-slate-400 truncate">{coin.nameRu}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className={`inline-flex items-center gap-1 font-medium ${sentimentColor}`}>
                        <SentimentIcon sentiment={coin.sentiment} />
                        {getSentimentLabel(coin.sentiment)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {coin.bullishCount + coin.bearishCount + coin.neutralCount} нов.
                      </span>
                      {coin.breakingCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-0.5 text-amber-400 font-medium tabular-nums">
                            <Zap className="w-3 h-3" />
                            {coin.breakingCount} резк.
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-base font-semibold tabular-nums text-slate-100">
                      {formatPriceUsd(coin.priceUsd)}
                    </div>
                    <div
                      className={`font-mono text-xs tabular-nums mt-0.5 ${
                        is24hUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {is24hUp ? '+' : ''}
                      {coin.change24hPct.toFixed(2)}% (24ч)
                    </div>
                  </div>
                </div>

                {/* Animated 0-10 Scale */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                  <AnimatedImpactMeter score={coin.impactScore} sentiment={coin.sentiment} />
                </div>

                {/* Price Reaction & Sparkline Row */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">Реакция на новости</div>
                    <div className={`font-mono text-sm font-semibold tabular-nums mt-0.5 ${reactionColor}`}>
                      {isReactionUp ? '+' : ''}
                      {coin.newsReactionPct.toFixed(2)}% импульс
                      <span className="text-slate-500 font-normal text-xs ml-1.5">
                        (1ч: {coin.change1hPct >= 0 ? '+' : ''}
                        {coin.change1hPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <Sparkline points={coin.sparkline7d} positive={is24hUp} />
                </div>

                {/* Top Driving News Headline */}
                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  {coin.topNewsTitle ? (
                    <p className="text-xs text-slate-300 line-clamp-1">
                      <span className="text-slate-500 mr-1.5">Главный драйвер:</span>
                      {coin.topNewsTitle}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Активных новостей за последний цикл не найдено
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
