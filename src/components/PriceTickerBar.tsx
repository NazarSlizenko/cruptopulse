import type { CoinMarketState } from '../types/crypto';
import { formatPriceUsd } from './CoinImpactGrid';

interface PriceTickerBarProps {
  coins: CoinMarketState[];
  selectedCoin: string | null;
  onSelectCoin: (symbol: string | null) => void;
}

export function PriceTickerBar({ coins, selectedCoin, onSelectCoin }: PriceTickerBarProps) {
  if (coins.length === 0) {
    return (
      <div className="border-b border-slate-800/80 bg-[#0D131E] h-10 flex items-center px-4 sm:px-6 lg:px-8">
        <span className="text-xs text-slate-500">Загрузка актуальных котировок...</span>
      </div>
    );
  }

  // Duplicate list once so translate3d(-50%) loops seamlessly without jumps
  const loopItems = [...coins, ...coins];

  return (
    <div
      className="ticker-container relative overflow-hidden border-b border-slate-800/80 bg-[#0D131E] h-10 flex items-center select-none"
      aria-label="Бегущая строка актуальных цен криптовалют"
    >
      <div className="animate-ticker items-center">
        {loopItems.map((coin, index) => {
          const isUp = coin.change24hPct >= 0;
          const isSelected = selectedCoin === coin.symbol;
          return (
            <button
              key={`${coin.symbol}-${index}`}
              type="button"
              onClick={() => onSelectCoin(isSelected ? null : coin.symbol)}
              className={`inline-flex items-center gap-2 px-5 h-10 border-r border-slate-800/60 text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected ? 'bg-sky-500/15 text-sky-200' : 'hover:bg-slate-800/40'
              }`}
            >
              <span className="font-mono font-bold text-slate-100">{coin.symbol}</span>
              <span className="font-mono font-medium tabular-nums text-slate-200">
                {formatPriceUsd(coin.priceUsd)}
              </span>
              <span
                className={`font-mono tabular-nums ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? '+' : ''}
                {coin.change24hPct.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
