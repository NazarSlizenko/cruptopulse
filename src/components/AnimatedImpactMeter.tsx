import { motion } from 'motion/react';
import type { SentimentType } from '../types/crypto';

interface AnimatedImpactMeterProps {
  score: number; // 0 to 100
  sentiment: SentimentType;
  compact?: boolean;
}

export function getImpactLabel(score: number): string {
  if (score >= 85) return 'Критический импульс';
  if (score >= 70) return 'Сильный сигнал';
  if (score >= 45) return 'Заметное влияние';
  if (score >= 25) return 'Умеренный фон';
  return 'Рыночный шум';
}

export function getSentimentLabel(sentiment: SentimentType): string {
  if (sentiment === 'bullish') return 'Бычий';
  if (sentiment === 'bearish') return 'Медвежий';
  return 'Нейтральный';
}

export function AnimatedImpactMeter({ score, sentiment, compact = false }: AnimatedImpactMeterProps) {
  const clamped = Math.round(Math.max(0, Math.min(100, score)));

  const gradientClass =
    sentiment === 'bullish'
      ? 'from-emerald-600/80 via-emerald-400 to-teal-300'
      : sentiment === 'bearish'
      ? 'from-rose-700/80 via-rose-500 to-amber-400'
      : clamped >= 70
      ? 'from-amber-600/80 via-amber-400 to-yellow-300'
      : 'from-sky-600/75 via-sky-400 to-cyan-300';

  const markerColor =
    sentiment === 'bullish'
      ? 'bg-emerald-300'
      : sentiment === 'bearish'
      ? 'bg-rose-300'
      : clamped >= 70
      ? 'bg-amber-300'
      : 'bg-sky-300';

  const labelColor =
    clamped >= 85
      ? sentiment === 'bearish'
        ? 'text-rose-400'
        : sentiment === 'bullish'
        ? 'text-emerald-400'
        : 'text-amber-300'
      : clamped >= 70
      ? sentiment === 'bearish'
        ? 'text-rose-400'
        : sentiment === 'bullish'
        ? 'text-emerald-400'
        : 'text-amber-400'
      : 'text-slate-300';

  const scoreAccent =
    clamped >= 85
      ? 'text-amber-300'
      : clamped >= 70
      ? 'text-slate-100'
      : 'text-slate-200';

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className={`text-xs font-medium ${labelColor} whitespace-nowrap`}>
          {getImpactLabel(clamped)}
        </span>
        <div className="flex items-baseline gap-1 font-mono tabular-nums whitespace-nowrap">
          <span className={`text-sm font-bold ${scoreAccent}`}>{clamped}</span>
          <span className="text-[11px] text-slate-500">/ 100</span>
        </div>
      </div>

      <div
        className={`relative w-full rounded-full bg-slate-800/90 border border-slate-700/50 ${
          compact ? 'h-1.5' : 'h-2'
        }`}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Индекс влияния новости ${clamped} из 100`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <motion.div
            initial={{ scaleX: 0, opacity: 0.4 }}
            animate={{ scaleX: clamped / 100, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left center' }}
            className={`h-full w-full bg-gradient-to-r ${gradientClass}`}
          />
        </div>

        <span
          aria-hidden="true"
          style={{ left: '85%' }}
          className="absolute -top-0.5 -bottom-0.5 w-px bg-amber-400/50 pointer-events-none"
        />

        {clamped > 2 && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ left: `${clamped}%` }}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${markerColor} ${
              compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
            } ring-2 ring-[#111827] pointer-events-none`}
          />
        )}
      </div>

      {!compact && (
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-500">
          <span>0</span>
          <span>50</span>
          <span className={clamped >= 85 ? 'text-amber-400 font-semibold' : ''}>85 порог</span>
          <span>100</span>
        </div>
      )}
    </div>
  );
}
