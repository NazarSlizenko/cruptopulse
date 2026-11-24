import { ArrowDownRight, ArrowUpRight, Layers, Minus } from 'lucide-react';
import type { CoinMarketState, NewsCluster } from '../types/crypto';
import { AnimatedImpactMeter, getSentimentLabel } from './AnimatedImpactMeter';
import { formatPriceUsd } from './CoinImpactGrid';

interface ResonanceClustersProps {
  clusters: NewsCluster[];
  coins: CoinMarketState[];
  onSelectCoin: (symbol: string | null) => void;
}

export function ResonanceClusters({ clusters, coins, onSelectCoin }: ResonanceClustersProps) {
  if (clusters.length === 0) return null;

  const coinMap = new Map(coins.map((c) => [c.symbol, c]));

  return (
    <section id="resonance" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Волны резонанса: схожие новости в нескольких СМИ
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Когда одно событие одновременно публикуют несколько изданий, достоверность и сила рыночного импульса (0–100) усиливаются.
          </p>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          Активных тем: {clusters.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clusters.slice(0, 4).map((cluster) => {
          const sentimentColor =
            cluster.sentiment === 'bullish'
              ? 'text-emerald-400'
              : cluster.sentiment === 'bearish'
              ? 'text-rose-400'
              : 'text-slate-300';

          const sign = cluster.estimatedReactionPct > 0 ? '+' : '';

          return (
            <div
              key={cluster.id}
              className="rounded-xl bg-[#111827] border border-slate-800 p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 text-sky-400 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    Подтверждено в {cluster.sourceCount} СМИ ({cluster.articleCount} публ.)
                  </span>
                  <span className={`inline-flex items-center gap-1 font-medium ${sentimentColor}`}>
                    {cluster.sentiment === 'bullish' && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {cluster.sentiment === 'bearish' && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {cluster.sentiment === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                    {getSentimentLabel(cluster.sentiment)}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-100 leading-snug">
                  {cluster.topicTitle}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {cluster.signalMeaning}
                </p>

                {cluster.synergies && cluster.synergies.length > 0 && (
                  <div className="text-xs text-sky-300 font-medium">
                    Связка факторов: {cluster.synergies.join(' · ')}
                  </div>
                )}

                <div className="text-xs text-slate-400">
                  Источники: <span className="text-slate-300">{cluster.sources.join(' · ')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <AnimatedImpactMeter score={cluster.impactScore} sentiment={cluster.sentiment} />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    {cluster.coins.map((sym) => {
                      const live = coinMap.get(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => onSelectCoin(sym)}
                          className="font-mono text-slate-200 hover:text-sky-300 transition-colors cursor-pointer tabular-nums"
                        >
                          {sym}{' '}
                          <span className="text-slate-500">
                            {live ? formatPriceUsd(live.priceUsd) : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <span className={`font-mono font-semibold tabular-nums ${sentimentColor}`}>
                    Реакция {sign}
                    {cluster.estimatedReactionPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
