import { ArrowDownRight, ArrowUpRight, ExternalLink, Minus, Zap } from 'lucide-react';
import type { CoinMarketState, NewsItem } from '../types/crypto';
import { AnimatedImpactMeter, getSentimentLabel } from './AnimatedImpactMeter';
import { formatPriceUsd } from './CoinImpactGrid';

interface BreakingSpotlightProps {
  news: NewsItem[];
  coins: CoinMarketState[];
}

function formatRelativeTime(iso: string): string {
  const diffMin = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ч назад`;
  return `${Math.round(diffHr / 24)} дн назад`;
}

export function BreakingSpotlight({ news, coins }: BreakingSpotlightProps) {
  const sortedByImpact = [...news].sort((a, b) => b.impactScore - a.impactScore);
  const breakingList = sortedByImpact.filter((n) => n.isBreaking).slice(0, 3);
  const displayList = breakingList.length > 0 ? breakingList : sortedByImpact.slice(0, 3);

  const coinLookup = new Map(coins.map((c) => [c.symbol, c]));

  if (displayList.length === 0) return null;

  return (
    <section id="breaking" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Резкие новости с высоким влиянием на цену
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            События с оценкой 70–100, способные вызвать быстрый ценовой импульс.
          </p>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          Обнаружено резких сигналов: {news.filter((n) => n.isBreaking).length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {displayList.map((item) => {
          const sentimentColor =
            item.sentiment === 'bullish'
              ? 'text-emerald-400'
              : item.sentiment === 'bearish'
              ? 'text-rose-400'
              : 'text-slate-300';

          const reactionSign = item.estimatedReactionPct > 0 ? '+' : '';

          return (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-xl bg-[#111827] border border-slate-800 p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="text-slate-200 font-medium truncate">{item.source}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums whitespace-nowrap">{formatRelativeTime(item.publishedAt)}</span>
                    {item.resonanceCount && item.resonanceCount >= 2 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-sky-400 font-medium whitespace-nowrap">
                          {item.resonanceCount} СМИ
                        </span>
                      </>
                    )}
                  </div>
                  {item.isBreaking && (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium whitespace-nowrap shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                      Резкая новость
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-base font-semibold leading-snug text-slate-100">
                  {item.titleRu || item.title}
                </h3>

                {item.aiSummaryRu && (
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    {item.aiSummaryRu}
                  </p>
                )}

                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 font-medium ${sentimentColor}`}>
                    {item.sentiment === 'bullish' && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {item.sentiment === 'bearish' && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {item.sentiment === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                    {getSentimentLabel(item.sentiment)}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className={`font-mono font-medium tabular-nums ${sentimentColor}`}>
                    Ожид. реакция {reactionSign}{item.estimatedReactionPct.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                  <AnimatedImpactMeter score={item.impactScore} sentiment={item.sentiment} />
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="text-xs text-slate-400">Влияние на затронутые монеты:</div>
                  <div className="space-y-1">
                    {item.coinImpacts.slice(0, 3).map((ci) => {
                      const live = coinLookup.get(ci.symbol);
                      const rColor =
                        ci.estimatedReactionPct > 0
                          ? 'text-emerald-400'
                          : ci.estimatedReactionPct < 0
                          ? 'text-rose-400'
                          : 'text-slate-300';
                      return (
                        <div
                          key={ci.symbol}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-200">{ci.symbol}</span>
                            {live && (
                              <span className="font-mono text-slate-400 tabular-nums">
                                {formatPriceUsd(live.priceUsd)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-mono tabular-nums">
                            <span className="text-slate-200">{Math.round(ci.impactScore)}/100</span>
                            <span className={rColor}>
                              ({ci.estimatedReactionPct > 0 ? '+' : ''}
                              {ci.estimatedReactionPct.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {item.synergies && item.synergies.length > 0 && (
                  <p className="mt-3 text-xs text-sky-300 font-medium">
                    Связка: {item.synergies.join(' · ')}
                  </p>
                )}

                {item.matchedKeywords.length > 0 && (
                  <p className="mt-2 text-xs text-slate-400">
                    Триггеры:{' '}
                    {item.matchedKeywords.slice(0, 4).map((k, idx) => (
                      <span key={k.word}>
                        {idx > 0 && <span className="text-slate-600"> · </span>}
                        <span
                          className={
                            k.polarity === 'bullish'
                              ? 'text-emerald-400'
                              : k.polarity === 'bearish'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }
                        >
                          {k.polarity === 'bullish' ? '+' : k.polarity === 'bearish' ? '−' : '!'}
                          {k.word}
                        </span>
                      </span>
                    ))}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {item.aiSummaryRu ? 'ИИ + ключевой скоринг' : 'Ключевой скоринг'}
                </span>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  Источник
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
