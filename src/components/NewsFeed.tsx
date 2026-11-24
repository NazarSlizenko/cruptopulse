import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Minus,
  Search,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import type { CoinMarketState, NewsItem, SentimentType } from '../types/crypto';
import { AnimatedImpactMeter, getSentimentLabel } from './AnimatedImpactMeter';
import { formatPriceUsd } from './CoinImpactGrid';

interface NewsFeedProps {
  news: NewsItem[];
  coins: CoinMarketState[];
  selectedCoin: string | null;
  onSelectCoin: (symbol: string | null) => void;
  loading?: boolean;
}

type FeedFilter = 'all' | SentimentType | 'breaking';

function formatTimeShort(iso: string): string {
  const date = new Date(iso);
  const diffMin = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ч назад`;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

export function NewsFeed({
  news,
  coins,
  selectedCoin,
  onSelectCoin,
  loading,
}: NewsFeedProps) {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [query, setQuery] = useState('');

  const coinMap = new Map(coins.map((c) => [c.symbol, c]));

  const filteredNews = news.filter((item) => {
    if (selectedCoin && !item.coins.includes(selectedCoin)) return false;
    if (filter === 'breaking' && !item.isBreaking) return false;
    if (filter === 'bullish' && item.sentiment !== 'bullish') return false;
    if (filter === 'bearish' && item.sentiment !== 'bearish') return false;
    if (filter === 'neutral' && item.sentiment !== 'neutral') return false;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const inTitle =
        item.title.toLowerCase().includes(q) ||
        (item.titleRu ? item.titleRu.toLowerCase().includes(q) : false);
      const inKw = item.matchedKeywords.some((k) => k.word.toLowerCase().includes(q));
      const inCoins = item.coins.some((c) => c.toLowerCase().includes(q));
      if (!inTitle && !inKw && !inCoins) return false;
    }
    return true;
  });

  return (
    <section id="feed" className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Лента криптоновостей по ключевым словам
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Автоматическое распределение на бычьи, медвежьи и нейтральные новости с оценкой реакции цены.
          </p>
        </div>

        <div className="text-xs text-slate-400 tabular-nums">
          Показано материалов: {filteredNews.length} из {news.length}
        </div>
      </div>

      {/* Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg self-start">
          {(
            [
              { id: 'all', label: 'Все новости' },
              { id: 'bullish', label: 'Бычий' },
              { id: 'bearish', label: 'Медвежий' },
              { id: 'neutral', label: 'Нейтральный' },
              { id: 'breaking', label: 'Резкие 70+' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedCoin && (
            <button
              type="button"
              onClick={() => onSelectCoin(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-300 hover:bg-sky-500/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Монета: {selectedCoin}
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <select
            aria-label="Фильтр по криптовалюте"
            value={selectedCoin ?? ''}
            onChange={(e) => onSelectCoin(e.target.value || null)}
            className="rounded-lg bg-[#111827] border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">Все монеты</option>
            {coins.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} — {c.nameRu}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по словам или монете..."
              className="w-full rounded-lg bg-[#111827] border border-slate-800 pl-8 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* News List */}
      {loading && news.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#111827] border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="rounded-xl bg-[#111827] border border-slate-800 p-8 text-center space-y-3">
          <p className="text-sm text-slate-300">
            По выбранным фильтрам новостей не найдено.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setQuery('');
              onSelectCoin(null);
            }}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80 rounded-xl bg-[#111827] border border-slate-800">
          {filteredNews.map((item) => {
            const sentimentColor =
              item.sentiment === 'bullish'
                ? 'text-emerald-400'
                : item.sentiment === 'bearish'
                ? 'text-rose-400'
                : 'text-slate-400';

            const reactionSign = item.estimatedReactionPct > 0 ? '+' : '';

            return (
              <article key={item.id} className="p-5 hover:bg-[#131C2D]/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-200">{item.source}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatTimeShort(item.publishedAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`inline-flex items-center gap-1 font-medium ${sentimentColor}`}>
                        {item.sentiment === 'bullish' && <ArrowUpRight className="w-3.5 h-3.5" />}
                        {item.sentiment === 'bearish' && <ArrowDownRight className="w-3.5 h-3.5" />}
                        {item.sentiment === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                        {getSentimentLabel(item.sentiment)}
                      </span>
                      {item.resonanceCount && item.resonanceCount >= 2 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-400 font-medium">
                            Подтверждено в {item.resonanceCount} СМИ
                          </span>
                        </>
                      )}
                      {item.isBreaking && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                            <Zap className="w-3.5 h-3.5" />
                            Резкий сигнал
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-100 leading-snug">
                      {item.titleRu || item.title}
                    </h3>

                    {(item.aiSummaryRu || item.summary) && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {item.aiSummaryRu || item.summary}
                      </p>
                    )}

                    {item.synergies && item.synergies.length > 0 && (
                      <div className="text-xs text-sky-300 font-medium pt-0.5">
                        Связка: {item.synergies.join(' · ')}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs">
                      {item.matchedKeywords.length > 0 && (
                        <span className="text-slate-400">
                          Ключевые слова:{' '}
                          {item.matchedKeywords.map((k, idx) => (
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
                        </span>
                      )}

                      <div className="flex items-center gap-3 ml-auto">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                        >
                          Открыть
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72 shrink-0 space-y-3 lg:pl-5 lg:border-l lg:border-slate-800/80">
                    <AnimatedImpactMeter score={item.impactScore} sentiment={item.sentiment} compact />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Оценка реакции цены:</span>
                      <span className={`font-mono font-semibold tabular-nums ${sentimentColor}`}>
                        {reactionSign}
                        {item.estimatedReactionPct.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                      {item.coinImpacts.slice(0, 3).map((ci) => {
                        const live = coinMap.get(ci.symbol);
                        return (
                          <button
                            key={ci.symbol}
                            type="button"
                            onClick={() => onSelectCoin(ci.symbol)}
                            className="font-mono hover:text-sky-300 transition-colors cursor-pointer tabular-nums"
                          >
                            {ci.symbol}{' '}
                            <span className="text-slate-500">
                              {live ? formatPriceUsd(live.priceUsd) : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
