import type {
  CoinImpactBreakdown,
  CoinMarketState,
  MatchedKeyword,
  NewsCluster,
  NewsItem,
  SentimentType,
} from '../src/types/crypto.ts';

export interface CoinDefinition {
  id: string;
  symbol: string;
  name: string;
  nameRu: string;
  binanceSymbol: string;
  coincapId: string;
  aliases: string[];
}

export const TRACKED_COINS: CoinDefinition[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    nameRu: 'Биткоин',
    binanceSymbol: 'BTCUSDT',
    coincapId: 'bitcoin',
    aliases: [
      'bitcoin', 'btc', 'биткоин', 'биткойн', 'биток', 'сатоши', 'satoshi',
      'microstrategy', 'saylor', 'сэйлор', 'ibit', 'fbtc', 'gbtc', 'spot btc',
      'btcusd', 'taproot', 'ordinals', 'runes', 'bitgo',
    ],
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    nameRu: 'Эфириум',
    binanceSymbol: 'ETHUSDT',
    coincapId: 'ethereum',
    aliases: [
      'ethereum', 'eth', 'ether', 'эфириум', 'эфир', 'vitalik', 'виталик',
      'бутерин', 'pectra', 'fusaka', 'eigenlayer', 'lido', 'ethusd', 'etha',
      'erc-20', 'arbitrum', 'optimism', 'restaking', 'рестейкинг',
    ],
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    nameRu: 'Солана',
    binanceSymbol: 'SOLUSDT',
    coincapId: 'solana',
    aliases: [
      'solana', 'sol', 'солана', 'pump.fun', 'jupiter', 'raydium', 'phantom',
      'firedancer', 'jito', 'solusd', 'sol etf', 'яковенко', 'drift', 'kamino',
    ],
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    nameRu: 'Рипл (XRP)',
    binanceSymbol: 'XRPUSDT',
    coincapId: 'xrp',
    aliases: ['xrp', 'ripple', 'рипл', 'rlusd', 'garlinghouse', 'гарлингхаус', 'xrpl'],
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    nameRu: 'BNB Chain',
    binanceSymbol: 'BNBUSDT',
    coincapId: 'binance-coin',
    aliases: ['bnb', 'binance', 'бинанс', 'bsc', 'changpeng zhao', 'чжао', 'bnb chain', 'pancakeswap'],
  },
  {
    id: 'the-open-network',
    symbol: 'TON',
    name: 'Toncoin',
    nameRu: 'Тонкоин',
    binanceSymbol: 'TONUSDT',
    coincapId: 'toncoin',
    aliases: [
      'toncoin', 'ton', 'тонкоин', 'the open network', 'durov', 'дуров',
      'telegram', 'телеграм', 'notcoin', 'hamster', 'ston.fi', 'dedust',
    ],
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    nameRu: 'Догикоин',
    binanceSymbol: 'DOGEUSDT',
    coincapId: 'dogecoin',
    aliases: ['dogecoin', 'doge', 'догикоин', 'доге', 'доги', 'elon musk', 'илон маск', 'd.o.g.e', 'x payments'],
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    nameRu: 'Кардано',
    binanceSymbol: 'ADAUSDT',
    coincapId: 'cardano',
    aliases: ['cardano', 'ada', 'кардано', 'hoskinson', 'хоскинсон', 'chang hard fork', 'hydra'],
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    nameRu: 'Аваланч',
    binanceSymbol: 'AVAXUSDT',
    coincapId: 'avalanche',
    aliases: ['avalanche', 'avax', 'аваланч', 'авакс', 'avax9000', 'subnet'],
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    nameRu: 'Чейнлинк',
    binanceSymbol: 'LINKUSDT',
    coincapId: 'chainlink',
    aliases: ['chainlink', 'link', 'чейнлинк', 'ccip', 'sergey nazarov', 'назаров', 'oracle'],
  },
  {
    id: 'sui',
    symbol: 'SUI',
    name: 'Sui',
    nameRu: 'Sui Network',
    binanceSymbol: 'SUIUSDT',
    coincapId: 'sui',
    aliases: ['sui', 'mysten', 'movevm', 'суи', 'walrus', 'deepbook', 'cetus'],
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    nameRu: 'Полкадот',
    binanceSymbol: 'DOTUSDT',
    coincapId: 'polkadot',
    aliases: ['polkadot', 'dot', 'полкадот', 'parachain', 'парачейн', 'gavin wood', 'гэвин вуд'],
  },
  {
    id: 'near',
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    nameRu: 'NEAR Протокол',
    binanceSymbol: 'NEARUSDT',
    coincapId: 'near-protocol',
    aliases: ['near protocol', 'near', 'ниар', 'полосухин', 'chain abstraction'],
  },
  {
    id: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    nameRu: 'Лайткоин',
    binanceSymbol: 'LTCUSDT',
    coincapId: 'litecoin',
    aliases: ['litecoin', 'ltc', 'лайткоин', 'ltc etf', 'mweb'],
  },
];

// Inter-coin market correlation spillover for high-impact news
const COIN_CORRELATIONS: Record<string, Array<{ symbol: string; factor: number }>> = {
  BTC: [
    { symbol: 'ETH', factor: 0.72 },
    { symbol: 'SOL', factor: 0.58 },
    { symbol: 'BNB', factor: 0.48 },
  ],
  ETH: [
    { symbol: 'LINK', factor: 0.56 },
    { symbol: 'ARB', factor: 0.50 },
    { symbol: 'AVAX', factor: 0.45 },
  ],
  SOL: [
    { symbol: 'SUI', factor: 0.46 },
    { symbol: 'DOGE', factor: 0.42 },
  ],
  BNB: [
    { symbol: 'BTC', factor: 0.45 },
    { symbol: 'ETH', factor: 0.42 },
  ],
};

interface KeywordRule {
  pattern: string;
  label: string;
  weight: number;
  polarity: 'bullish' | 'bearish' | 'shock';
  suppressWords?: string[];
}

const CONTEXTUAL_PHRASES: KeywordRule[] = [
  // Bullish compound context
  { pattern: 'drops lawsuit', label: 'иск отозван', weight: 3.4, polarity: 'bullish', suppressWords: ['drop', 'drops', 'lawsuit'] },
  { pattern: 'dismisses lawsuit', label: 'иск отклонён', weight: 3.4, polarity: 'bullish', suppressWords: ['lawsuit'] },
  { pattern: 'case dismissed', label: 'дело закрыто', weight: 3.2, polarity: 'bullish' },
  { pattern: 'прекратила иск', label: 'иск прекращён', weight: 3.4, polarity: 'bullish', suppressWords: ['иск'] },
  { pattern: 'сняла обвинения', label: 'обвинения сняты', weight: 3.3, polarity: 'bullish' },
  { pattern: 'etf approved', label: 'одобрение ETF', weight: 3.6, polarity: 'bullish', suppressWords: ['approval', 'approved'] },
  { pattern: 'approves spot etf', label: 'одобрение спотового ETF', weight: 3.7, polarity: 'bullish' },
  { pattern: 'одобрила etf', label: 'одобрение ETF', weight: 3.6, polarity: 'bullish' },
  { pattern: 'одобрила спотовый', label: 'одобрение спотового ETF', weight: 3.6, polarity: 'bullish' },
  { pattern: 'short squeeze', label: 'шорт-сквиз', weight: 2.9, polarity: 'bullish' },
  { pattern: 'шорт-сквиз', label: 'шорт-сквиз', weight: 2.9, polarity: 'bullish' },
  { pattern: 'net inflow', label: 'чистый приток', weight: 2.8, polarity: 'bullish' },
  { pattern: 'чистый приток', label: 'чистый приток', weight: 2.8, polarity: 'bullish' },
  { pattern: 'strategic reserve', label: 'стратегический резерв', weight: 3.4, polarity: 'bullish' },
  { pattern: 'стратегический резерв', label: 'стратегический резерв', weight: 3.4, polarity: 'bullish' },
  { pattern: 'golden cross', label: 'золотой крест', weight: 2.5, polarity: 'bullish' },
  { pattern: 'золотой крест', label: 'золотой крест', weight: 2.5, polarity: 'bullish' },
  { pattern: 'record tvl', label: 'рекордный TVL', weight: 2.6, polarity: 'bullish' },
  { pattern: 'airdrop', label: 'аирдроп', weight: 2.2, polarity: 'bullish', suppressWords: ['drop', 'drops'] },
  { pattern: 'аирдроп', label: 'аирдроп', weight: 2.2, polarity: 'bullish' },
  { pattern: 'token burn', label: 'сжигание токенов', weight: 2.3, polarity: 'bullish' },
  { pattern: 'сжигание токенов', label: 'сжигание токенов', weight: 2.3, polarity: 'bullish' },
  { pattern: 'whale buys', label: 'покупки китов', weight: 2.5, polarity: 'bullish' },
  { pattern: 'киты скупают', label: 'покупки китов', weight: 2.6, polarity: 'bullish' },
  { pattern: 'open interest surges', label: 'рост открытого интереса', weight: 2.4, polarity: 'bullish' },
  { pattern: 'rate cut', label: 'снижение ставки ФРС', weight: 3.0, polarity: 'bullish' },
  { pattern: 'снижение ставки', label: 'снижение ставки ФРС', weight: 3.0, polarity: 'bullish' },
  { pattern: 'cpi cools', label: 'замедление инфляции', weight: 2.7, polarity: 'bullish' },
  { pattern: 'pro-crypto', label: 'крипто-дружественная политика', weight: 2.4, polarity: 'bullish' },
  { pattern: 'spot etf', label: 'спотовый ETF', weight: 2.2, polarity: 'shock' },
  { pattern: 'спотовый etf', label: 'спотовый ETF', weight: 2.2, polarity: 'shock' },
  { pattern: 'funding rate', label: 'ставка финансирования', weight: 1.7, polarity: 'shock' },
  { pattern: 'ставка финансирования', label: 'ставка финансирования', weight: 1.7, polarity: 'shock' },

  // Bearish compound context
  { pattern: 'etf rejected', label: 'отказ по ETF', weight: 3.5, polarity: 'bearish' },
  { pattern: 'rejects etf', label: 'отказ по ETF', weight: 3.5, polarity: 'bearish' },
  { pattern: 'отклонила etf', label: 'отказ по ETF', weight: 3.5, polarity: 'bearish' },
  { pattern: 'etf delayed', label: 'перенос решения по ETF', weight: 2.5, polarity: 'bearish' },
  { pattern: 'net outflow', label: 'чистый отток', weight: 2.8, polarity: 'bearish' },
  { pattern: 'чистый отток', label: 'чистый отток', weight: 2.8, polarity: 'bearish' },
  { pattern: 'long squeeze', label: 'лонг-сквиз', weight: 2.9, polarity: 'bearish' },
  { pattern: 'лонг-сквиз', label: 'лонг-сквиз', weight: 2.9, polarity: 'bearish' },
  { pattern: 'death cross', label: 'крест смерти', weight: 2.6, polarity: 'bearish' },
  { pattern: 'крест смерти', label: 'крест смерти', weight: 2.6, polarity: 'bearish' },
  { pattern: 'rug pull', label: 'рагпул / скам', weight: 3.5, polarity: 'bearish' },
  { pattern: 'exit scam', label: 'экзит-скам', weight: 3.6, polarity: 'bearish' },
  { pattern: 'bridge hack', label: 'взлом моста', weight: 3.7, polarity: 'bearish' },
  { pattern: 'взлом моста', label: 'взлом моста', weight: 3.7, polarity: 'bearish' },
  { pattern: 'wallet drain', label: 'вывод украденного', weight: 3.5, polarity: 'bearish' },
  { pattern: 'security breach', label: 'взлом безопасности', weight: 3.4, polarity: 'bearish' },
  { pattern: 'halts withdrawals', label: 'остановка вывода средств', weight: 3.5, polarity: 'bearish' },
  { pattern: 'приостановила вывод', label: 'приостановка вывода', weight: 3.5, polarity: 'bearish' },
  { pattern: 'frozen funds', label: 'заморозка активов', weight: 3.0, polarity: 'bearish' },
  { pattern: 'rate hike', label: 'повышение ставки ФРС', weight: 3.0, polarity: 'bearish' },
  { pattern: 'повышение ставки', label: 'повышение ставки ФРС', weight: 3.0, polarity: 'bearish' },
  { pattern: 'cpi hotter', label: 'рост инфляции CPI', weight: 2.8, polarity: 'bearish' },
  { pattern: 'hawkish fed', label: 'жёсткая риторика ФРС', weight: 2.7, polarity: 'bearish' },
  { pattern: 'whale dump', label: 'распродажа китов', weight: 2.8, polarity: 'bearish' },
  { pattern: 'слив китов', label: 'распродажа китов', weight: 2.8, polarity: 'bearish' },
  { pattern: 'token unlock', label: 'крупный разлок токенов', weight: 2.3, polarity: 'bearish' },
  { pattern: 'разлок токенов', label: 'разлок токенов', weight: 2.3, polarity: 'bearish' },
  { pattern: 'sec sues', label: 'иск SEC', weight: 3.4, polarity: 'bearish' },
  { pattern: 'иск sec', label: 'иск SEC', weight: 3.4, polarity: 'bearish' },
  { pattern: 'no hack', label: 'взлом опровергнут', weight: 1.4, polarity: 'bullish', suppressWords: ['hack', 'hacked'] },
  { pattern: 'без взлома', label: 'без взлома', weight: 1.4, polarity: 'bullish', suppressWords: ['взлом'] },
];

const SINGLE_KEYWORDS: KeywordRule[] = [
  // Bullish
  { pattern: 'approval', label: 'одобрение', weight: 2.6, polarity: 'bullish' },
  { pattern: 'approved', label: 'одобрено', weight: 2.7, polarity: 'bullish' },
  { pattern: 'all-time high', label: 'исторический максимум', weight: 3.2, polarity: 'bullish' },
  { pattern: 'ath', label: 'новый максимум ATH', weight: 2.8, polarity: 'bullish' },
  { pattern: 'surge', label: 'резкий рост', weight: 2.5, polarity: 'bullish' },
  { pattern: 'surges', label: 'резкий рост', weight: 2.5, polarity: 'bullish' },
  { pattern: 'soar', label: 'взлёт', weight: 2.6, polarity: 'bullish' },
  { pattern: 'soars', label: 'взлёт', weight: 2.6, polarity: 'bullish' },
  { pattern: 'jumps', label: 'скачок вверх', weight: 2.3, polarity: 'bullish' },
  { pattern: 'climbs', label: 'подъём', weight: 2.0, polarity: 'bullish' },
  { pattern: 'skyrocket', label: 'стремительный рост', weight: 3.0, polarity: 'bullish' },
  { pattern: 'skyrockets', label: 'стремительный рост', weight: 3.0, polarity: 'bullish' },
  { pattern: 'rally', label: 'ралли', weight: 2.3, polarity: 'bullish' },
  { pattern: 'rallies', label: 'ралли', weight: 2.3, polarity: 'bullish' },
  { pattern: 'breakout', label: 'пробой сопротивления', weight: 2.3, polarity: 'bullish' },
  { pattern: 'bullish', label: 'бычий импульс', weight: 2.3, polarity: 'bullish' },
  { pattern: 'inflow', label: 'приток капитала', weight: 2.4, polarity: 'bullish' },
  { pattern: 'inflows', label: 'приток капитала', weight: 2.5, polarity: 'bullish' },
  { pattern: 'institutional', label: 'институциональный спрос', weight: 2.2, polarity: 'bullish' },
  { pattern: 'adoption', label: 'массовое внедрение', weight: 2.1, polarity: 'bullish' },
  { pattern: 'partnership', label: 'партнёрство', weight: 1.9, polarity: 'bullish' },
  { pattern: 'treasury', label: 'корпоративный резерв', weight: 2.3, polarity: 'bullish' },
  { pattern: 'accumulation', label: 'накопление позиций', weight: 2.0, polarity: 'bullish' },
  { pattern: 'listing', label: 'листинг на бирже', weight: 2.3, polarity: 'bullish' },
  { pattern: 'upgrade', label: 'обновление протокола', weight: 1.8, polarity: 'bullish' },
  { pattern: 'mainnet', label: 'запуск мейннета', weight: 2.2, polarity: 'bullish' },
  { pattern: 'buyback', label: 'обратный выкуп', weight: 2.2, polarity: 'bullish' },
  { pattern: 'halving', label: 'халвинг', weight: 2.4, polarity: 'bullish' },
  { pattern: 'staking', label: 'стейкинг', weight: 1.6, polarity: 'bullish' },
  { pattern: 'rebound', label: 'отскок вверх', weight: 1.8, polarity: 'bullish' },
  { pattern: 'rebounds', label: 'отскок вверх', weight: 1.8, polarity: 'bullish' },
  { pattern: 'recovery', label: 'восстановление', weight: 1.7, polarity: 'bullish' },
  { pattern: 'gains', label: 'прирост', weight: 1.6, polarity: 'bullish' },
  { pattern: 'rwa', label: 'токенизация RWA', weight: 1.9, polarity: 'bullish' },
  { pattern: 'depin', label: 'сектор DePIN', weight: 1.7, polarity: 'bullish' },
  // Russian bullish
  { pattern: 'одобрил', label: 'одобрение', weight: 2.9, polarity: 'bullish' },
  { pattern: 'одобрен', label: 'одобрение', weight: 2.9, polarity: 'bullish' },
  { pattern: 'вырос', label: 'рост цены', weight: 2.2, polarity: 'bullish' },
  { pattern: 'рост', label: 'рост', weight: 1.8, polarity: 'bullish' },
  { pattern: 'взлет', label: 'взлёт', weight: 2.6, polarity: 'bullish' },
  { pattern: 'взлёт', label: 'взлёт', weight: 2.6, polarity: 'bullish' },
  { pattern: 'ралли', label: 'ралли', weight: 2.4, polarity: 'bullish' },
  { pattern: 'максимум', label: 'ценовой максимум', weight: 2.5, polarity: 'bullish' },
  { pattern: 'рекорд', label: 'новый рекорд', weight: 2.7, polarity: 'bullish' },
  { pattern: 'приток', label: 'приток средств', weight: 2.4, polarity: 'bullish' },
  { pattern: 'бычий', label: 'бычий тренд', weight: 2.3, polarity: 'bullish' },
  { pattern: 'партнерств', label: 'партнёрство', weight: 2.0, polarity: 'bullish' },
  { pattern: 'партнёрств', label: 'партнёрство', weight: 2.0, polarity: 'bullish' },
  { pattern: 'инвестиц', label: 'инвестиции', weight: 1.9, polarity: 'bullish' },
  { pattern: 'листинг', label: 'листинг на бирже', weight: 2.3, polarity: 'bullish' },
  { pattern: 'пробой', label: 'пробой уровня', weight: 2.2, polarity: 'bullish' },
  { pattern: 'институционал', label: 'институциональный спрос', weight: 2.2, polarity: 'bullish' },
  { pattern: 'скупают', label: 'крупные покупки', weight: 2.4, polarity: 'bullish' },
  { pattern: 'накоплен', label: 'накопление позиций', weight: 2.0, polarity: 'bullish' },
  { pattern: 'отскок', label: 'отскок цены', weight: 1.8, polarity: 'bullish' },
  { pattern: 'восстанов', label: 'восстановление', weight: 1.7, polarity: 'bullish' },
  { pattern: 'стейкинг', label: 'стейкинг', weight: 1.6, polarity: 'bullish' },

  // Bearish
  { pattern: 'hack', label: 'взлом', weight: 3.6, polarity: 'bearish' },
  { pattern: 'hacked', label: 'взлом', weight: 3.8, polarity: 'bearish' },
  { pattern: 'exploit', label: 'эксплойт', weight: 3.4, polarity: 'bearish' },
  { pattern: 'exploited', label: 'эксплойт', weight: 3.5, polarity: 'bearish' },
  { pattern: 'phishing', label: 'фишинг', weight: 2.6, polarity: 'bearish' },
  { pattern: 'drain', label: 'вывод украденного', weight: 3.0, polarity: 'bearish' },
  { pattern: 'drains', label: 'вывод украденного', weight: 3.0, polarity: 'bearish' },
  { pattern: 'lawsuit', label: 'судебный иск', weight: 2.8, polarity: 'bearish' },
  { pattern: 'crackdown', label: 'регуляторное давление', weight: 2.7, polarity: 'bearish' },
  { pattern: 'ban', label: 'запрет', weight: 3.0, polarity: 'bearish' },
  { pattern: 'bankruptcy', label: 'банкротство', weight: 3.8, polarity: 'bearish' },
  { pattern: 'insolvency', label: 'неплатежеспособность', weight: 3.5, polarity: 'bearish' },
  { pattern: 'crash', label: 'обвал', weight: 3.3, polarity: 'bearish' },
  { pattern: 'crashes', label: 'обвал', weight: 3.3, polarity: 'bearish' },
  { pattern: 'plunge', label: 'резкое падение', weight: 2.9, polarity: 'bearish' },
  { pattern: 'plunges', label: 'резкое падение', weight: 2.9, polarity: 'bearish' },
  { pattern: 'plummet', label: 'стремительное падение', weight: 3.1, polarity: 'bearish' },
  { pattern: 'plummets', label: 'стремительное падение', weight: 3.1, polarity: 'bearish' },
  { pattern: 'tumble', label: 'падение', weight: 2.4, polarity: 'bearish' },
  { pattern: 'tumbles', label: 'падение', weight: 2.4, polarity: 'bearish' },
  { pattern: 'dump', label: 'слив', weight: 2.6, polarity: 'bearish' },
  { pattern: 'dumps', label: 'слив', weight: 2.6, polarity: 'bearish' },
  { pattern: 'sinks', label: 'просадка', weight: 2.3, polarity: 'bearish' },
  { pattern: 'drops', label: 'снижение', weight: 1.8, polarity: 'bearish' },
  { pattern: 'lose', label: 'потери капитала', weight: 2.5, polarity: 'bearish' },
  { pattern: 'loses', label: 'потери капитала', weight: 2.5, polarity: 'bearish' },
  { pattern: 'loss', label: 'убыток', weight: 2.3, polarity: 'bearish' },
  { pattern: 'losses', label: 'убытки', weight: 2.4, polarity: 'bearish' },
  { pattern: 'sell-off', label: 'распродажа', weight: 2.6, polarity: 'bearish' },
  { pattern: 'liquidation', label: 'ликвидации', weight: 2.8, polarity: 'bearish' },
  { pattern: 'liquidations', label: 'каскад ликвидаций', weight: 3.0, polarity: 'bearish' },
  { pattern: 'outflow', label: 'отток капитала', weight: 2.4, polarity: 'bearish' },
  { pattern: 'outflows', label: 'отток капитала', weight: 2.5, polarity: 'bearish' },
  { pattern: 'delist', label: 'делистинг', weight: 2.9, polarity: 'bearish' },
  { pattern: 'delisting', label: 'делистинг', weight: 3.0, polarity: 'bearish' },
  { pattern: 'fraud', label: 'мошенничество', weight: 3.1, polarity: 'bearish' },
  { pattern: 'scam', label: 'скам', weight: 3.1, polarity: 'bearish' },
  { pattern: 'arrest', label: 'арест', weight: 3.0, polarity: 'bearish' },
  { pattern: 'investigation', label: 'расследование', weight: 2.3, polarity: 'bearish' },
  { pattern: 'bearish', label: 'медвежий сигнал', weight: 2.3, polarity: 'bearish' },
  { pattern: 'slump', label: 'спад', weight: 2.1, polarity: 'bearish' },
  { pattern: 'drop', label: 'снижение', weight: 1.8, polarity: 'bearish' },
  { pattern: 'tariff', label: 'тарифы / пошлины', weight: 2.4, polarity: 'bearish' },
  { pattern: 'sanction', label: 'санкции', weight: 2.7, polarity: 'bearish' },
  { pattern: 'vulnerability', label: 'уязвимость', weight: 2.8, polarity: 'bearish' },
  { pattern: 'depeg', label: 'депег стейблкоина', weight: 3.4, polarity: 'bearish' },
  { pattern: 'capitulation', label: 'капитуляция рынка', weight: 2.8, polarity: 'bearish' },
  // Russian bearish
  { pattern: 'взлом', label: 'взлом', weight: 3.6, polarity: 'bearish' },
  { pattern: 'атак', label: 'хакерская атака', weight: 3.0, polarity: 'bearish' },
  { pattern: 'украли', label: 'кража активов', weight: 3.4, polarity: 'bearish' },
  { pattern: 'похитили', label: 'хищение', weight: 3.4, polarity: 'bearish' },
  { pattern: 'обвал', label: 'обвал', weight: 3.3, polarity: 'bearish' },
  { pattern: 'упал', label: 'падение цены', weight: 2.4, polarity: 'bearish' },
  { pattern: 'рухнул', label: 'обвал цены', weight: 3.2, polarity: 'bearish' },
  { pattern: 'падение', label: 'падение цены', weight: 2.3, polarity: 'bearish' },
  { pattern: 'снизил', label: 'снижение', weight: 1.8, polarity: 'bearish' },
  { pattern: 'банкрот', label: 'банкротство', weight: 3.7, polarity: 'bearish' },
  { pattern: 'запрет', label: 'запрет', weight: 3.0, polarity: 'bearish' },
  { pattern: 'штраф', label: 'штраф', weight: 2.4, polarity: 'bearish' },
  { pattern: 'иск', label: 'судебный иск', weight: 2.7, polarity: 'bearish' },
  { pattern: 'отток', label: 'отток капитала', weight: 2.4, polarity: 'bearish' },
  { pattern: 'ликвидац', label: 'ликвидации', weight: 2.9, polarity: 'bearish' },
  { pattern: 'делистинг', label: 'делистинг', weight: 2.9, polarity: 'bearish' },
  { pattern: 'медвеж', label: 'медвежий тренд', weight: 2.3, polarity: 'bearish' },
  { pattern: 'уязвимост', label: 'уязвимость', weight: 2.8, polarity: 'bearish' },
  { pattern: 'скам', label: 'скам', weight: 3.2, polarity: 'bearish' },
  { pattern: 'санкц', label: 'санкции', weight: 2.7, polarity: 'bearish' },
  { pattern: 'распродаж', label: 'распродажа', weight: 2.5, polarity: 'bearish' },
  { pattern: 'депег', label: 'депег стейблкоина', weight: 3.4, polarity: 'bearish' },
  { pattern: 'блокировк', label: 'блокировка', weight: 2.5, polarity: 'bearish' },

  // Shock / Macro / Urgent Amplifiers
  { pattern: 'breaking', label: 'срочная новость', weight: 2.2, polarity: 'shock' },
  { pattern: 'urgent', label: 'экстренно', weight: 2.2, polarity: 'shock' },
  { pattern: 'just in', label: 'только что', weight: 2.0, polarity: 'shock' },
  { pattern: 'sec', label: 'регулятор SEC', weight: 2.0, polarity: 'shock' },
  { pattern: 'cftc', label: 'регулятор CFTC', weight: 1.8, polarity: 'shock' },
  { pattern: 'mica', label: 'регулирование MiCA', weight: 1.8, polarity: 'shock' },
  { pattern: 'fed', label: 'ФРС США', weight: 2.1, polarity: 'shock' },
  { pattern: 'fomc', label: 'заседание FOMC', weight: 2.3, polarity: 'shock' },
  { pattern: 'powell', label: 'Джером Пауэлл', weight: 2.0, polarity: 'shock' },
  { pattern: 'blackrock', label: 'BlackRock', weight: 2.1, polarity: 'shock' },
  { pattern: 'fidelity', label: 'Fidelity', weight: 1.9, polarity: 'shock' },
  { pattern: 'etf', label: 'крипто-ETF', weight: 2.0, polarity: 'shock' },
  { pattern: 'trump', label: 'политика США', weight: 1.8, polarity: 'shock' },
  { pattern: 'billion', label: 'миллиардный масштаб', weight: 2.0, polarity: 'shock' },
  { pattern: 'cpi', label: 'инфляция CPI', weight: 2.1, polarity: 'shock' },
  { pattern: 'pce', label: 'индекс PCE', weight: 2.0, polarity: 'shock' },
  { pattern: 'ppi', label: 'индекс PPI', weight: 1.9, polarity: 'shock' },
  { pattern: 'nfp', label: 'рынок труда NFP', weight: 2.0, polarity: 'shock' },
  { pattern: 'emergency', label: 'чрезвычайно', weight: 2.3, polarity: 'shock' },
  { pattern: 'tether', label: 'эмитент Tether', weight: 1.9, polarity: 'shock' },
  { pattern: 'stablecoin', label: 'стейблкоины', weight: 1.6, polarity: 'shock' },
  { pattern: 'hard fork', label: 'хардфорк сети', weight: 1.9, polarity: 'shock' },
  { pattern: 'срочно', label: 'срочно', weight: 2.3, polarity: 'shock' },
  { pattern: 'фрс', label: 'ФРС США', weight: 2.1, polarity: 'shock' },
  { pattern: 'пауэлл', label: 'Джером Пауэлл', weight: 2.0, polarity: 'shock' },
  { pattern: 'цб', label: 'центробанк', weight: 1.8, polarity: 'shock' },
  { pattern: 'млрд', label: 'миллиардный объём', weight: 2.0, polarity: 'shock' },
  { pattern: 'резко', label: 'резкое движение', weight: 2.0, polarity: 'shock' },
  { pattern: 'экстрен', label: 'экстренно', weight: 2.2, polarity: 'shock' },
  { pattern: 'хардфорк', label: 'хардфорк', weight: 1.9, polarity: 'shock' },
];

interface SynergyRule {
  name: string;
  groupA: string[];
  groupB: string[];
  boost: number;
  polarity: 'bullish' | 'bearish';
}

// Connections between co-occurring keywords that amplify conviction and clarify causal drivers
const SYNERGY_RULES: SynergyRule[] = [
  {
    name: 'Институциональный приток через ETF',
    groupA: ['крипто-ETF', 'спотовый ETF', 'одобрение ETF', 'одобрение спотового ETF', 'BlackRock', 'Fidelity'],
    groupB: ['приток капитала', 'чистый приток', 'приток средств', 'институциональный спрос', 'накопление позиций', 'одобрение'],
    boost: 1.8,
    polarity: 'bullish',
  },
  {
    name: 'Институциональный отток из ETF',
    groupA: ['крипто-ETF', 'спотовый ETF', 'BlackRock', 'Fidelity'],
    groupB: ['отток капитала', 'чистый отток', 'распродажа', 'потери капитала', 'снижение', 'падение цены'],
    boost: 1.8,
    polarity: 'bearish',
  },
  {
    name: 'Макро-смягчение ликвидности',
    groupA: ['ФРС США', 'заседание FOMC', 'Джером Пауэлл', 'инфляция CPI', 'индекс PCE'],
    groupB: ['снижение ставки ФРС', 'замедление инфляции', 'отскок вверх', 'отскок цены', 'ралли'],
    boost: 2.0,
    polarity: 'bullish',
  },
  {
    name: 'Макро-давление на риск-активы',
    groupA: ['ФРС США', 'заседание FOMC', 'Джером Пауэлл', 'инфляция CPI', 'тарифы / пошлины'],
    groupB: ['повышение ставки ФРС', 'жёсткая риторика ФРС', 'рост инфляции CPI', 'распродажа', 'падение цены', 'обвал'],
    boost: 2.0,
    polarity: 'bearish',
  },
  {
    name: 'Критический инцидент безопасности',
    groupA: ['взлом', 'эксплойт', 'взлом моста', 'хакерская атака', 'уязвимость', 'взлом безопасности'],
    groupB: ['вывод украденного', 'кража активов', 'хищение', 'миллиардный масштаб', 'остановка вывода средств', 'приостановка вывода'],
    boost: 2.2,
    polarity: 'bearish',
  },
  {
    name: 'Каскад маржинальных ликвидаций',
    groupA: ['ликвидации', 'каскад ликвидаций', 'лонг-сквиз'],
    groupB: ['обвал', 'обвал цены', 'резкое падение', 'стремительное падение', 'слив', 'распродажа китов'],
    boost: 2.0,
    polarity: 'bearish',
  },
  {
    name: 'Снятие регуляторного риска',
    groupA: ['регулятор SEC', 'регулятор CFTC', 'регулирование MiCA'],
    groupB: ['иск отозван', 'иск отклонён', 'дело закрыто', 'иск прекращён', 'обвинения сняты', 'одобрение ETF'],
    boost: 2.1,
    polarity: 'bullish',
  },
  {
    name: 'Регуляторный удар',
    groupA: ['регулятор SEC', 'регулятор CFTC', 'санкции', 'запрет'],
    groupB: ['судебный иск', 'иск SEC', 'штраф', 'делистинг', 'расследование', 'регуляторное давление'],
    boost: 1.9,
    polarity: 'bearish',
  },
  {
    name: 'Системный риск ликвидности',
    groupA: ['стейблкоины', 'эмитент Tether', 'депег стейблкоина'],
    groupB: ['банкротство', 'неплатежеспособность', 'блокировка', 'заморозка активов', 'остановка вывода средств'],
    boost: 2.3,
    polarity: 'bearish',
  },
  {
    name: 'Импульс листинга и токеномики',
    groupA: ['листинг на бирже', 'аирдроп', 'запуск мейннета', 'обновление протокола'],
    groupB: ['сжигание токенов', 'обратный выкуп', 'рекордный TVL', 'стейкинг', 'партнёрство', 'массовое внедрение'],
    boost: 1.7,
    polarity: 'bullish',
  },
];

const MACRO_WORDS = [
  'crypto', 'sec', 'fed', 'fomc', 'cpi', 'pce', 'inflation', 'etf', 'market',
  'крипторын', 'фрс', 'биткоин', 'регулир', 'стейблкоин', 'defi',
];

const MICROCAP_NOISE_PATTERNS = [
  'memecoin', 'meme coin', 'мемкоин', 'мем-токен', 'мемтокен',
  'creator coin', 'celebrity token', 'influencer', 'ansem', 'bullpen',
  'presale', 'пресейл', 'price prediction', 'прогноз цены',
  'can it reach', 'will it hit', 'может вырасти до', 'трейдер, чье имя',
  'чье имя носит', 'airdrop guide', 'airdrop claim', 'rugpull alert',
];

const MAJOR_INSTITUTION_WORDS = [
  'blackrock', 'fidelity', 'grayscale', 'ark invest', 'vaneck', 'sec', 'cftc',
  'fed', 'fomc', 'powell', 'фрс', 'пауэлл', 'ecb', 'ецб', 'цб рф', 'jpmorgan',
  'goldman', 'morgan stanley', 'coinbase', 'binance', 'kraken', 'bybit', 'okx',
  'tether', 'circle', 'microstrategy', 'strategy', 'etf', 'treasury',
];

const RECAP_TEMPORAL_PATTERNS = [
  'in november', 'in october', 'in december', 'in january', 'in february',
  'in march', 'in april', 'in may', 'in june', 'in july', 'in august', 'in september',
  'this month', 'this week', 'last month', 'monthly', 'quarterly', 'so far in',
  'в ноябре', 'в октябре', 'в декабре', 'за месяц', 'за неделю', 'по итогам',
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsToken(text: string, token: string): boolean {
  const clean = token.trim().toLowerCase();
  if (/^[a-z0-9.\-]+$/i.test(clean)) {
    const regex = new RegExp(`(^|[^a-z0-9])${escapeRegex(clean)}([^a-z0-9]|$)`, 'i');
    return regex.test(text);
  }
  if (/^[а-яё]+$/i.test(clean) && clean.length <= 5) {
    const regex = new RegExp(`(^|[^а-яё])${escapeRegex(clean)}`, 'i');
    return regex.test(text);
  }
  return text.includes(clean);
}

export function detectDirectCoins(text: string): { coins: string[]; isMacro: boolean } {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const coin of TRACKED_COINS) {
    if (coin.aliases.some((alias) => containsToken(lower, alias))) {
      matched.push(coin.symbol);
    }
  }

  const isMacro = MACRO_WORDS.some((m) => containsToken(lower, m));
  if (matched.length === 0 && isMacro) {
    matched.push('BTC', 'ETH');
  }

  return { coins: matched.slice(0, 5), isMacro };
}

export function classifyTextByKeywords(
  title: string,
  summary: string,
  publishedAtMs: number
): {
  sentiment: SentimentType;
  sentimentScore: number;
  impactScore: number;
  isBreaking: boolean;
  estimatedReactionPct: number;
  matchedKeywords: MatchedKeyword[];
  synergies: string[];
  coins: string[];
  coinImpacts: CoinImpactBreakdown[];
  isNoise: boolean;
} {
  const combined = `${title} ${summary}`.toLowerCase();
  const titleLower = title.toLowerCase();

  const matchedKeywords: MatchedKeyword[] = [];
  const seenLabels = new Set<string>();
  const suppressedTokens = new Set<string>();

  let bullishTotal = 0;
  let bearishTotal = 0;
  let shockTotal = 0;

  const addMatch = (rule: KeywordRule, weight: number) => {
    if (rule.polarity === 'bullish') bullishTotal += weight;
    else if (rule.polarity === 'bearish') bearishTotal += weight;
    else shockTotal += weight;

    if (!seenLabels.has(rule.label)) {
      seenLabels.add(rule.label);
      matchedKeywords.push({
        word: rule.label,
        polarity: rule.polarity,
        weight: Number(weight.toFixed(1)),
      });
    }
  };

  for (const rule of CONTEXTUAL_PHRASES) {
    if (containsToken(combined, rule.pattern)) {
      const inTitle = containsToken(titleLower, rule.pattern);
      const w = inTitle ? rule.weight * 1.25 : rule.weight;
      addMatch(rule, w);
      if (rule.suppressWords) {
        for (const sw of rule.suppressWords) suppressedTokens.add(sw.toLowerCase());
      }
    }
  }

  for (const rule of SINGLE_KEYWORDS) {
    if (suppressedTokens.has(rule.pattern.toLowerCase())) continue;
    if (containsToken(combined, rule.pattern)) {
      const inTitle = containsToken(titleLower, rule.pattern);
      const w = inTitle ? rule.weight * 1.25 : rule.weight;
      addMatch(rule, w);
    }
  }

  const synergies: string[] = [];
  let synergyImpactBonus = 0;

  for (const syn of SYNERGY_RULES) {
    const hasA = syn.groupA.some((lbl) => seenLabels.has(lbl));
    const hasB = syn.groupB.some((lbl) => seenLabels.has(lbl));
    if (hasA && hasB) {
      synergies.push(syn.name);
      synergyImpactBonus += syn.boost;
      if (syn.polarity === 'bullish') bullishTotal += syn.boost * 0.65;
      else bearishTotal += syn.boost * 0.65;
    }
  }

  // Dollar magnitude boost (only large scale moves the broader market)
  const dollarMatch = combined.match(/\$\s*(\d+(?:\.\d+)?)\s*(b|billion|m|million|млрд|млн)/i);
  let magnitudeBoost = 0;
  if (dollarMatch) {
    const unit = dollarMatch[2].toLowerCase();
    const num = parseFloat(dollarMatch[1]);
    if (unit.startsWith('b') || unit === 'млрд') {
      magnitudeBoost += 2.0;
    } else if (unit.startsWith('m') && num >= 100) {
      magnitudeBoost += 1.2;
    } else if (unit.startsWith('m') && num >= 20) {
      magnitudeBoost += 0.5;
    }
  }

  const netScore = bullishTotal - bearishTotal;
  let sentiment: SentimentType = 'neutral';
  if (netScore >= 1.2) sentiment = 'bullish';
  else if (netScore <= -1.2) sentiment = 'bearish';

  const { coins: directCoins, isMacro } = detectDirectCoins(`${title} ${summary}`);
  const hasMajorInstitution = MAJOR_INSTITUTION_WORDS.some((w) => containsToken(combined, w));
  const matchesMicrocapNoise = MICROCAP_NOISE_PATTERNS.some((p) => combined.includes(p));
  const isPeriodRecap = RECAP_TEMPORAL_PATTERNS.some((p) => titleLower.includes(p));
  const hasConflictingSignals = bullishTotal >= 1.6 && bearishTotal >= 1.6;

  // Local memecoin / celebrity coin / price prediction without a major institution or direct top coin -> local noise
  const isLocalNoise =
    (matchesMicrocapNoise && !hasMajorInstitution) ||
    (directCoins.length === 0 && !isMacro && !hasMajorInstitution);

  const ageHours = Math.max(0, (Date.now() - publishedAtMs) / (1000 * 60 * 60));
  const recencyBoost = ageHours < 2 ? 0.5 : ageHours < 6 ? 0.25 : 0;

  // Directional clarity: mixed signals (e.g. outflow + rebound in same title) dampen conviction instead of inflating it
  const directionalClarity = Math.abs(bullishTotal - bearishTotal) + Math.min(bullishTotal, bearishTotal) * 0.1;
  let scopeMultiplier = isLocalNoise ? 0.3 : directCoins.length > 0 || hasMajorInstitution ? 1.0 : 0.7;
  if (isPeriodRecap) scopeMultiplier *= 0.72;
  if (hasConflictingSignals) scopeMultiplier *= 0.85;

  const rawStrength =
    (0.7 +
      directionalClarity * 0.85 +
      shockTotal * 0.68 +
      synergyImpactBonus * 0.62 +
      magnitudeBoost +
      recencyBoost) *
    scopeMultiplier;

  // Asymptotic curve: typical news 25-60, strong 65-80, >85 reserved for major market shocks
  let impactScore = Math.round(100 * (1 - Math.exp(-rawStrength / 9.2)));
  if (isLocalNoise) {
    impactScore = Math.min(34, impactScore);
  }
  impactScore = Math.min(97, Math.max(5, impactScore));
  const isBreaking = impactScore >= 70;

  const baseReaction = Math.pow(impactScore / 100, 1.65) * 9.0;
  const sign = sentiment === 'bullish' ? 1 : sentiment === 'bearish' ? -1 : 0;
  const estimatedReactionPct =
    sign === 0
      ? Number((Math.min(1.0, impactScore * 0.01)).toFixed(2))
      : Number((sign * Math.max(0.25, baseReaction)).toFixed(2));

  const coinImpactMap = new Map<string, CoinImpactBreakdown>();
  const effectiveCoins = isLocalNoise ? [] : directCoins.length > 0 ? directCoins : ['BTC'];

  effectiveCoins.forEach((symbol, idx) => {
    const decay = idx === 0 ? 1 : Math.max(0.45, 1 - idx * 0.22);
    const coinScore = Math.round(Math.min(97, Math.max(5, impactScore * decay)));
    const coinReact = Number((estimatedReactionPct * decay).toFixed(2));
    coinImpactMap.set(symbol, {
      symbol,
      impactScore: coinScore,
      estimatedReactionPct: coinReact,
      sentiment,
    });
  });

  // Spillover correlations only for high-conviction tracked coin events (>= 76)
  if (!isLocalNoise && impactScore >= 76 && effectiveCoins.length > 0) {
    const primaryCoin = effectiveCoins[0];
    const spillovers = COIN_CORRELATIONS[primaryCoin] ?? [];
    for (const sp of spillovers) {
      if (coinImpactMap.has(sp.symbol)) continue;
      if (!TRACKED_COINS.some((c) => c.symbol === sp.symbol)) continue;
      const spScore = Math.round(Math.min(90, Math.max(10, impactScore * sp.factor)));
      const spReact = Number((estimatedReactionPct * sp.factor).toFixed(2));
      coinImpactMap.set(sp.symbol, {
        symbol: sp.symbol,
        impactScore: spScore,
        estimatedReactionPct: spReact,
        sentiment,
      });
    }
  }

  const coinImpacts = Array.from(coinImpactMap.values()).sort((a, b) => b.impactScore - a.impactScore);
  const coins = coinImpacts.map((c) => c.symbol);

  matchedKeywords.sort((a, b) => b.weight - a.weight);

  return {
    sentiment,
    sentimentScore: Number(netScore.toFixed(2)),
    impactScore,
    isBreaking,
    estimatedReactionPct,
    matchedKeywords: matchedKeywords.slice(0, 6),
    synergies: synergies.slice(0, 3),
    coins,
    coinImpacts,
    isNoise: isLocalNoise,
  };
}

// Cache Groq AI evaluations by news ID (12h TTL, max 400 entries) so each article is scored by Groq only once
interface GroqCachedEval {
  impactScore: number;
  sentiment: SentimentType;
  coins: string[];
  titleRu: string;
  aiSummaryRu: string;
  cachedAt: number;
}

const groqEvalCache = new Map<string, GroqCachedEval>();

/**
 * Batch-evaluates candidate high-impact articles using Groq free-tier API (llama-3.3-70b-versatile)
 * to filter out micro-cap / clickbait / monthly recap false positives and calibrate real 0-100 market impact.
 */
export async function refineImpactWithGroqBatch(newsList: NewsItem[]): Promise<void> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) return;

  const now = Date.now();
  const uncachedCandidates: NewsItem[] = [];

  for (const item of newsList) {
    const cached = groqEvalCache.get(item.id);
    if (cached && now - cached.cachedAt < 12 * 3600 * 1000) {
      applyGroqResultToItem(item, cached);
      continue;
    }
    if (item.impactScore >= 55 && uncachedCandidates.length < 10) {
      uncachedCandidates.push(item);
    }
  }

  if (uncachedCandidates.length === 0) return;

  const trackedList = TRACKED_COINS.map((c) => c.symbol).join(', ');
  const payloadItems = uncachedCandidates.map((n, idx) => ({
    i: idx,
    t: n.title.slice(0, 160),
    s: n.summary.slice(0, 160),
  }));

  const systemPrompt = `Ты — главный криптоаналитик. Оцени реальную силу влияния каждой новости на цены крупных криптовалют (${trackedList}) по шкале 0-100.
Правила строго:
- 0-35: локальные мемкоины, токены блогеров/трейдеров (например Ansem), прогнозы цен, кликбейт, мелкие суммы (<$10M). Ставь coins: [].
- 36-69: обычные новости, итоги за месяц/неделю ("in November", месячные обзоры ETF и т.п.), смешанные сигналы без шока прямо сейчас, партнёрства.
- 70-84: важные свежие события для конкретной крупной монеты из списка.
- 85-97: ТОЛЬКО внезапные рыночные шоки прямо сейчас (решения ФРС/CPI, одобрение/отказ спотового ETF, крупный взлом биржи/протокола >$50M, банкротство, каскад ликвидаций).
Ответь строго JSON объектом: {"items":[{"i":0,"score":45,"sent":"bullish"|"bearish"|"neutral","coins":["BTC"],"ru":"Короткий заголовок на русском","why":"1 короткое предложение сути на русском"}]}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7500);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(payloadItems) },
        ],
      }),
    });
    clearTimeout(timer);

    if (!res.ok) return;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return;

    const parsed = JSON.parse(raw) as {
      items?: Array<{
        i: number;
        score: number;
        sent: SentimentType;
        coins: string[];
        ru?: string;
        why?: string;
      }>;
    };

    const validSymbols = new Set(TRACKED_COINS.map((c) => c.symbol));
    for (const entry of parsed.items ?? []) {
      const target = uncachedCandidates[entry.i];
      if (!target) continue;

      const score = Math.round(Math.min(98, Math.max(5, Number(entry.score) || target.impactScore)));
      const sentiment: SentimentType = ['bullish', 'bearish', 'neutral'].includes(entry.sent)
        ? entry.sent
        : target.sentiment;
      const coins = Array.isArray(entry.coins)
        ? entry.coins.map((c) => String(c).toUpperCase()).filter((c) => validSymbols.has(c))
        : target.coins;

      const cachedVal: GroqCachedEval = {
        impactScore: score,
        sentiment,
        coins,
        titleRu: entry.ru ? String(entry.ru) : target.title,
        aiSummaryRu: entry.why ? String(entry.why) : '',
        cachedAt: now,
      };

      groqEvalCache.set(target.id, cachedVal);
      if (groqEvalCache.size > 400) {
        const firstKey = groqEvalCache.keys().next().value;
        if (firstKey) groqEvalCache.delete(firstKey);
      }
      applyGroqResultToItem(target, cachedVal);
    }
  } catch {
    // Keep deterministic score if Groq call times out or hits limit
  }
}

function applyGroqResultToItem(item: NewsItem, evalRes: GroqCachedEval): void {
  item.impactScore = evalRes.impactScore;
  item.sentiment = evalRes.sentiment;
  item.isBreaking = evalRes.impactScore >= 70;
  item.isNoise = evalRes.coins.length === 0 && evalRes.impactScore <= 35;
  item.titleRu = evalRes.titleRu;
  if (evalRes.aiSummaryRu) {
    item.aiSummaryRu = evalRes.aiSummaryRu;
  }

  const sign = evalRes.sentiment === 'bullish' ? 1 : evalRes.sentiment === 'bearish' ? -1 : 0;
  const baseReaction = Math.pow(evalRes.impactScore / 100, 1.65) * 9.0;
  item.estimatedReactionPct =
    sign === 0
      ? Number((Math.min(1.0, evalRes.impactScore * 0.01)).toFixed(2))
      : Number((sign * Math.max(0.25, baseReaction)).toFixed(2));

  item.coins = evalRes.coins;
  item.coinImpacts = evalRes.coins.map((sym, idx) => {
    const decay = idx === 0 ? 1 : Math.max(0.45, 1 - idx * 0.22);
    return {
      symbol: sym,
      impactScore: Math.round(Math.min(98, Math.max(5, evalRes.impactScore * decay))),
      estimatedReactionPct: Number((item.estimatedReactionPct * decay).toFixed(2)),
      sentiment: evalRes.sentiment,
    };
  });
}

export function aggregateCoinStates(
  marketPrices: Map<
    string,
    {
      priceUsd: number;
      change1hPct: number;
      change24hPct: number;
      volume24hUsd: number;
      marketCapUsd: number;
      sparkline7d: number[];
    }
  >,
  newsList: NewsItem[]
): CoinMarketState[] {
  return TRACKED_COINS.map((coin) => {
    const market = marketPrices.get(coin.symbol) ?? {
      priceUsd: 0,
      change1hPct: 0,
      change24hPct: 0,
      volume24hUsd: 0,
      marketCapUsd: 0,
      sparkline7d: [],
    };

    const relevantNews = newsList.filter((n) => n.coins.includes(coin.symbol));

    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;
    let breakingCount = 0;
    let weightedImpactSum = 0;
    let weightSum = 0;
    let maxNewsImpact = 0;
    let reactionSum = 0;
    const keywordFreq = new Map<string, number>();

    let topNews: NewsItem | undefined;
    let topCoinScore = 0;

    for (const item of relevantNews) {
      if (item.sentiment === 'bullish') bullishCount++;
      else if (item.sentiment === 'bearish') bearishCount++;
      else neutralCount++;
      if (item.isBreaking) breakingCount++;

      const breakdown = item.coinImpacts.find((c) => c.symbol === coin.symbol);
      const score = breakdown ? breakdown.impactScore : item.impactScore * 0.7;
      const reaction = breakdown ? breakdown.estimatedReactionPct : item.estimatedReactionPct * 0.7;

      if (score > maxNewsImpact) maxNewsImpact = score;
      if (!topNews || score > topCoinScore) {
        topNews = item;
        topCoinScore = score;
      }

      const recencyWeight = Math.max(0.3, 1 - (Date.now() - new Date(item.publishedAt).getTime()) / (48 * 3600 * 1000));
      weightedImpactSum += score * recencyWeight;
      weightSum += recencyWeight;
      reactionSum += reaction * recencyWeight;

      for (const kw of item.matchedKeywords) {
        keywordFreq.set(kw.word, (keywordFreq.get(kw.word) || 0) + 1);
      }
    }

    const realMoveAbs = Math.max(Math.abs(market.change1hPct) * 1.4, Math.abs(market.change24hPct) * 0.35);
    const marketVolatilityFactor = Math.min(16, realMoveAbs * 2.0);

    const avgNewsImpact = weightSum > 0 ? weightedImpactSum / weightSum : 0;
    const compositeImpact =
      relevantNews.length > 0
        ? Math.round(Math.min(98, maxNewsImpact * 0.55 + avgNewsImpact * 0.45 + marketVolatilityFactor * 0.28))
        : Math.round(Math.min(45, 10 + marketVolatilityFactor));

    const newsReactionPct =
      weightSum > 0
        ? Number((reactionSum / Math.max(1, weightSum * 0.85)).toFixed(2))
        : Number((market.change1hPct).toFixed(2));

    let sentiment: SentimentType = 'neutral';
    if (bullishCount > bearishCount) sentiment = 'bullish';
    else if (bearishCount > bullishCount) sentiment = 'bearish';
    else if (topNews) sentiment = topNews.sentiment;

    const topKeywords = Array.from(keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([word]) => word);

    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      nameRu: coin.nameRu,
      priceUsd: market.priceUsd,
      change1hPct: market.change1hPct,
      change24hPct: market.change24hPct,
      volume24hUsd: market.volume24hUsd,
      marketCapUsd: market.marketCapUsd,
      sparkline7d: market.sparkline7d,
      impactScore: compositeImpact,
      maxNewsImpact: Math.round(maxNewsImpact),
      newsReactionPct,
      sentiment,
      bullishCount,
      bearishCount,
      neutralCount,
      breakingCount,
      topNewsId: topNews?.id,
      topNewsTitle: topNews?.titleRu || topNews?.title,
      topKeywords,
    };
  });
}

const STOP_WORDS = new Set([
  'after', 'before', 'about', 'amid', 'with', 'from', 'into', 'over', 'under',
  'that', 'this', 'what', 'when', 'where', 'which', 'while', 'will', 'could',
  'would', 'should', 'crypto', 'market', 'price', 'prices', 'token', 'coin',
  'после', 'перед', 'через', 'около', 'почему', 'когда', 'рынок', 'крипто',
  'криптовалют', 'цена', 'цены', 'монет', 'токена', 'сообщил', 'заявил',
]);

function extractTopicSignature(item: NewsItem): Set<string> {
  const sig = new Set<string>();
  for (const kw of item.matchedKeywords) {
    sig.add(`kw:${kw.word}`);
  }
  for (const syn of item.synergies ?? []) {
    sig.add(`syn:${syn}`);
  }
  const words = item.title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9$%.\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
  for (const w of words.slice(0, 10)) {
    sig.add(`w:${w}`);
  }
  return sig;
}

function signatureSimilarity(a: Set<string>, b: Set<string>, coinsA: string[], coinsB: string[]): number {
  const sharedCoins = coinsA.filter((c) => coinsB.includes(c));
  if (sharedCoins.length === 0) return 0;

  let overlap = 0;
  let kwOverlap = 0;
  let synOverlap = 0;
  for (const token of a) {
    if (b.has(token)) {
      overlap++;
      if (token.startsWith('kw:')) kwOverlap++;
      if (token.startsWith('syn:')) synOverlap++;
    }
  }
  if (overlap === 0) return 0;
  const union = a.size + b.size - overlap;
  const jaccard = union > 0 ? overlap / union : 0;
  return jaccard + (kwOverlap >= 1 ? 0.14 : 0) + (synOverlap >= 1 ? 0.16 : 0) + (overlap >= 3 ? 0.12 : 0);
}

export function detectNewsResonanceClusters(newsList: NewsItem[]): NewsCluster[] {
  const now = Date.now();
  const recentWindowMs = 18 * 3600 * 1000;
  const recentItems = newsList.filter(
    (n) => !n.isNoise && n.coins.length > 0 && n.impactScore >= 36 && now - new Date(n.publishedAt).getTime() <= recentWindowMs
  );

  const signatures = new Map<string, Set<string>>();
  for (const item of recentItems) {
    signatures.set(item.id, extractTopicSignature(item));
  }

  const assigned = new Set<string>();
  const groups: NewsItem[][] = [];

  const ordered = [...recentItems].sort((a, b) => b.impactScore - a.impactScore);

  for (const seed of ordered) {
    if (assigned.has(seed.id)) continue;
    const seedSig = signatures.get(seed.id)!;
    const group: NewsItem[] = [seed];
    assigned.add(seed.id);

    for (const candidate of ordered) {
      if (assigned.has(candidate.id)) continue;
      if (seed.sentiment !== 'neutral' && candidate.sentiment !== 'neutral' && seed.sentiment !== candidate.sentiment) {
        continue;
      }
      const candSig = signatures.get(candidate.id)!;
      const sim = signatureSimilarity(seedSig, candSig, seed.coins, candidate.coins);
      if (sim >= 0.34) {
        group.push(candidate);
        assigned.add(candidate.id);
      }
    }

    const distinctSources = new Set(group.map((g) => g.source));
    if (distinctSources.size >= 2) {
      groups.push(group);
    }
  }

  const clusters: NewsCluster[] = [];

  for (const group of groups) {
    const distinctSources = Array.from(new Set(group.map((g) => g.source)));
    const sourceCount = distinctSources.length;

    const resonanceBoost = Math.min(10, (sourceCount - 1) * 3);

    let bullish = 0;
    let bearish = 0;
    let neutral = 0;
    const coinFreq = new Map<string, number>();
    const kwFreq = new Map<string, number>();
    const synFreq = new Map<string, number>();

    for (const item of group) {
      item.resonanceCount = sourceCount;
      item.impactScore = Math.min(98, item.impactScore + resonanceBoost);
      item.isBreaking = item.impactScore >= 70;
      const sign = item.sentiment === 'bullish' ? 1 : item.sentiment === 'bearish' ? -1 : 0;
      if (sign !== 0) {
        const boostedReact = Math.pow(item.impactScore / 100, 1.65) * 9.0;
        item.estimatedReactionPct = Number((sign * Math.max(0.3, boostedReact)).toFixed(2));
      }
      for (const ci of item.coinImpacts) {
        ci.impactScore = Math.min(98, ci.impactScore + Math.round(resonanceBoost * 0.8));
      }

      if (item.sentiment === 'bullish') bullish++;
      else if (item.sentiment === 'bearish') bearish++;
      else neutral++;

      for (const c of item.coins) coinFreq.set(c, (coinFreq.get(c) || 0) + 1);
      for (const kw of item.matchedKeywords) kwFreq.set(kw.word, (kwFreq.get(kw.word) || 0) + 1);
      for (const syn of item.synergies ?? []) synFreq.set(syn, (synFreq.get(syn) || 0) + 1);
    }

    let sentiment: SentimentType = 'neutral';
    if (bullish > bearish) sentiment = 'bullish';
    else if (bearish > bullish) sentiment = 'bearish';

    const maxScore = Math.max(...group.map((g) => g.impactScore));
    const avgScore = group.reduce((a, g) => a + g.impactScore, 0) / group.length;
    const clusterImpactScore = Math.round(Math.min(98, maxScore * 0.65 + avgScore * 0.35));

    const baseReaction = Math.pow(clusterImpactScore / 100, 1.55) * 9.5;
    const sign = sentiment === 'bullish' ? 1 : sentiment === 'bearish' ? -1 : 0;
    const estimatedReactionPct =
      sign === 0 ? 0.5 : Number((sign * Math.max(0.5, baseReaction)).toFixed(2));

    const coins = Array.from(coinFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([sym]) => sym);

    const keywords = Array.from(kwFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([w]) => w);

    const synergies = Array.from(synFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([s]) => s);

    const lead = [...group].sort((a, b) => b.impactScore - a.impactScore)[0];
    const latestAt = group.reduce(
      (latest, g) => (g.publishedAt > latest ? g.publishedAt : latest),
      group[0].publishedAt
    );

    let signalMeaning = '';
    if (sentiment === 'bullish') {
      signalMeaning =
        sourceCount >= 4
          ? `Сильный бычий консенсус (${sourceCount} СМИ): подтверждённый инфоповод ускоряет приток спроса и FOMO-импульс.`
          : `Бычий резонанс (${sourceCount} СМИ): синхронные публикации подтверждают позитивный драйвер для ${coins.join(', ')}.`;
    } else if (sentiment === 'bearish') {
      signalMeaning =
        sourceCount >= 4
          ? `Острая волна негатива (${sourceCount} СМИ): подтверждённый риск повышает вероятность панических продаж и ликвидаций.`
          : `Медвежий резонанс (${sourceCount} СМИ): повторяющиеся сигналы усиливают давление на цену ${coins.join(', ')}.`;
    } else {
      signalMeaning = `Информационный фокус (${sourceCount} СМИ): тема активно обсуждается рынком, возможен рост волатильности по ${coins.join(', ')}.`;
    }

    clusters.push({
      id: `cluster_${lead.id}`,
      topicTitle: lead.titleRu || lead.title,
      sources: distinctSources,
      sourceCount,
      articleCount: group.length,
      sentiment,
      impactScore: clusterImpactScore,
      estimatedReactionPct,
      coins,
      keywords,
      synergies,
      latestAt,
      signalMeaning,
    });
  }

  clusters.sort((a, b) => {
    if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
    return b.impactScore - a.impactScore;
  });

  return clusters.slice(0, 6);
}
