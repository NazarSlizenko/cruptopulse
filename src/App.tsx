import { useCallback, useEffect, useState } from 'react';
import { AnimatedImpactMeter, getSentimentLabel } from './components/AnimatedImpactMeter';
import { BreakingSpotlight } from './components/BreakingSpotlight';
import { CoinImpactGrid } from './components/CoinImpactGrid';
import { NewsFeed } from './components/NewsFeed';
import { PriceTickerBar } from './components/PriceTickerBar';
import { ResonanceClusters } from './components/ResonanceClusters';
import type { MarketPulseResponse } from './types/crypto';

const AUTO_REFRESH_MS = 15_000;

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export default function App() {
  const [pulse, setPulse] = useState<MarketPulseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  const loadPulse = useCallback(async (forceRefresh = false) => {
    setError(null);

    try {
      const res = await fetch(`/api/market-pulse${forceRefresh ? '?refresh=1' : ''}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось загрузить рыночные данные');
      }
      setPulse(data as MarketPulseResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      window.Telegram?.WebApp?.ready();
      window.Telegram?.WebApp?.expand();
    } catch {
      // Non-Telegram browser environment
    }

    loadPulse(false);

    const timer = setInterval(() => {
      loadPulse(true);
    }, AUTO_REFRESH_MS);

    return () => clearInterval(timer);
  }, [loadPulse]);

  const summary = pulse?.summary;
  const coins = pulse?.coins ?? [];
  const news = pulse?.news ?? [];

  const updatedLabel = pulse?.updatedAt
    ? new Date(pulse.updatedAt).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#0B0F17]/95 backdrop-blur border-b border-slate-800/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
          >
            КриптоПульс
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a
              href="#resonance"
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Резонанс
            </a>
            <a
              href="#breaking"
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Резкие сигналы
            </a>
            <a
              href="#coins"
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Обзор монет
            </a>
            <a
              href="#feed"
              className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Новости
            </a>
          </nav>
        </div>
      </header>

      {/* Live Scrolling Crypto Prices Bar */}
      <PriceTickerBar
        coins={coins}
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
      />

      <main id="top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero / Market Sentiment Overview */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100 text-balance">
                Монитор криптоновостей и реакции рынка
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Сбор актуальных новостей в реальном времени, анализ связей между ключевыми словами и распределение на бычьи, медвежьи и нейтральные сигналы со шкалой влияния 0–100.
              </p>
            </div>

            <div className="w-full lg:w-80 rounded-xl bg-[#111827] border border-slate-800 p-4 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Индекс новостного давления</span>
                <span className="font-mono text-slate-300 tabular-nums">{updatedLabel}</span>
              </div>
              <AnimatedImpactMeter
                score={summary?.marketImpactIndex ?? 0}
                sentiment={summary?.dominantSentiment ?? 'neutral'}
              />
              <div className="text-xs text-slate-400 pt-1">
                Общий фон рынка:{' '}
                <span
                  className={`font-medium ${
                    summary?.dominantSentiment === 'bullish'
                      ? 'text-emerald-400'
                      : summary?.dominantSentiment === 'bearish'
                      ? 'text-rose-400'
                      : 'text-slate-200'
                  }`}
                >
                  {summary ? getSentimentLabel(summary.dominantSentiment) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 4-column Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-[#111827] border border-slate-800 px-5 py-4">
              <div className="text-xs text-slate-400">Бычьи новости</div>
              <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-emerald-400">
                {summary ? summary.bullishCount : '—'}
              </div>
              <div className="mt-1 text-xs text-slate-500">позитивные триггеры</div>
            </div>

            <div className="rounded-xl bg-[#111827] border border-slate-800 px-5 py-4">
              <div className="text-xs text-slate-400">Медвежьи новости</div>
              <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-rose-400">
                {summary ? summary.bearishCount : '—'}
              </div>
              <div className="mt-1 text-xs text-slate-500">давление и риски</div>
            </div>

            <div className="rounded-xl bg-[#111827] border border-slate-800 px-5 py-4">
              <div className="text-xs text-slate-400">Нейтральный фон</div>
              <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-slate-200">
                {summary ? summary.neutralCount : '—'}
              </div>
              <div className="mt-1 text-xs text-slate-500">без резкого перекоса</div>
            </div>

            <div className="rounded-xl bg-[#111827] border border-slate-800 px-5 py-4">
              <div className="text-xs text-slate-400">Резкие сигналы (70–100)</div>
              <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-amber-400">
                {summary ? summary.breakingCount : '—'}
              </div>
              <div className="mt-1 text-xs text-slate-500">высокий ценовой импульс</div>
            </div>
          </div>

          {summary?.activeSources && summary.activeSources.length > 0 && (
            <div className="text-xs text-slate-500">
              Источники: {summary.activeSources.join(' · ')}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 px-4 py-3 text-sm text-rose-200">
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Simultaneous Multi-Source Resonance Waves */}
        <ResonanceClusters
          clusters={pulse?.clusters ?? []}
          coins={coins}
          onSelectCoin={setSelectedCoin}
        />

        {/* Breaking News Spotlight */}
        <BreakingSpotlight news={news} coins={coins} />

        {/* 14-Coin Animated 0-100 Impact Grid */}
        <CoinImpactGrid
          coins={coins}
          selectedCoin={selectedCoin}
          onSelectCoin={(sym) => {
            setSelectedCoin(sym);
          }}
          loading={loading}
        />

        {/* Full Keyword-Classified News Feed */}
        <NewsFeed
          news={news}
          coins={coins}
          selectedCoin={selectedCoin}
          onSelectCoin={setSelectedCoin}
          loading={loading}
        />
      </main>

      <footer className="border-t border-slate-800/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>КриптоПульс — аналитика криптоновостей и шкала рыночного импульса</span>
          <span>Мониторинг котировок и новостных лент в реальном времени</span>
        </div>
      </footer>
    </div>
  );
}
