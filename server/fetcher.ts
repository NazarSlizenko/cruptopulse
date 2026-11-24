import { XMLParser } from 'fast-xml-parser';
import type { MarketPulseResponse, NewsItem } from '../src/types/crypto.ts';
import {
  TRACKED_COINS,
  aggregateCoinStates,
  classifyTextByKeywords,
  detectNewsResonanceClusters,
  refineImpactWithGroqBatch,
} from './analyzer.ts';
import {
  dispatchTopBreakingNewsToTelegram,
  evaluateAndDispatchAlerts,
  getTelegramStatus,
} from './telegram.ts';

interface PriceSnapshot {
  priceUsd: number;
  change1hPct: number;
  change24hPct: number;
  volume24hUsd: number;
  marketCapUsd: number;
  sparkline7d: number[];
}

interface RawFeedArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  language: 'ru' | 'en';
  publishedAtMs: number;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
});

const USER_AGENT = 'CryptoPulse/1.0 (+https://localhost:3000)';

let cachedPrices: { data: Map<string, PriceSnapshot>; fetchedAt: number } | null = null;
let cachedNews: { data: NewsItem[]; sources: string[]; fetchedAt: number } | null = null;

const PRICE_TTL_MS = 10_000;
const NEWS_TTL_MS = 30_000;

function stripHtml(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;|&ndash;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json, application/xml, text/xml, application/rss+xml, */*',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCoinGeckoPrices(): Promise<Map<string, PriceSnapshot>> {
  const ids = TRACKED_COINS.map((c) => c.id).join(',');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&order=market_cap_desc&per_page=30&page=1&sparkline=true&price_change_percentage=1h,24h`;
  const res = await fetchWithTimeout(url, 8500);
  if (!res.ok) {
    throw new Error(`CoinGecko HTTP ${res.status}`);
  }
  const rows = (await res.json()) as Array<{
    id: string;
    symbol: string;
    current_price: number;
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_24h_in_currency?: number;
    price_change_percentage_24h?: number;
    total_volume?: number;
    market_cap?: number;
    sparkline_in_7d?: { price?: number[] };
  }>;

  const map = new Map<string, PriceSnapshot>();
  for (const row of rows) {
    const def = TRACKED_COINS.find((c) => c.id === row.id || c.symbol.toLowerCase() === row.symbol?.toLowerCase());
    if (!def) continue;
    const rawSpark = row.sparkline_in_7d?.price ?? [];
    // Downsample 168 hourly points to ~28 points for crisp inline sparklines
    const step = Math.max(1, Math.floor(rawSpark.length / 28));
    const sparkline7d = rawSpark.filter((_, i) => i % step === 0);

    map.set(def.symbol, {
      priceUsd: Number(row.current_price || 0),
      change1hPct: Number((row.price_change_percentage_1h_in_currency ?? 0).toFixed(2)),
      change24hPct: Number((row.price_change_percentage_24h_in_currency ?? row.price_change_percentage_24h ?? 0).toFixed(2)),
      volume24hUsd: Number(row.total_volume || 0),
      marketCapUsd: Number(row.market_cap || 0),
      sparkline7d,
    });
  }
  return map;
}

async function fetchBinanceFallbackPrices(): Promise<Map<string, PriceSnapshot>> {
  const symbols = JSON.stringify(TRACKED_COINS.map((c) => c.binanceSymbol));
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`;
  const res = await fetchWithTimeout(url, 7000);
  if (!res.ok) {
    throw new Error(`Binance HTTP ${res.status}`);
  }
  const rows = (await res.json()) as Array<{
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
  }>;

  const map = new Map<string, PriceSnapshot>();
  for (const row of rows) {
    const def = TRACKED_COINS.find((c) => c.binanceSymbol === row.symbol);
    if (!def) continue;
    const price = parseFloat(row.lastPrice) || 0;
    const change24h = parseFloat(row.priceChangePercent) || 0;
    const open = parseFloat(row.openPrice) || price;
    const low = parseFloat(row.lowPrice) || price;
    const high = parseFloat(row.highPrice) || price;
    map.set(def.symbol, {
      priceUsd: price,
      change1hPct: Number((change24h * 0.18).toFixed(2)),
      change24hPct: Number(change24h.toFixed(2)),
      volume24hUsd: parseFloat(row.quoteVolume) || 0,
      marketCapUsd: 0,
      sparkline7d: [open, (open + low) / 2, low, (low + high) / 2, high, price],
    });
  }
  return map;
}

async function fetchCoinCapFallbackPrices(): Promise<Map<string, PriceSnapshot>> {
  const ids = TRACKED_COINS.map((c) => c.coincapId).join(',');
  const res = await fetchWithTimeout(`https://api.coincap.io/v2/assets?ids=${encodeURIComponent(ids)}`, 7000);
  if (!res.ok) throw new Error(`CoinCap HTTP ${res.status}`);
  const payload = (await res.json()) as {
    data: Array<{
      id: string;
      symbol: string;
      priceUsd: string;
      changePercent24Hr: string;
      volumeUsd24Hr: string;
      marketCapUsd: string;
    }>;
  };
  const map = new Map<string, PriceSnapshot>();
  for (const row of payload.data || []) {
    const def = TRACKED_COINS.find((c) => c.coincapId === row.id || c.symbol === row.symbol);
    if (!def) continue;
    const change24 = parseFloat(row.changePercent24Hr) || 0;
    map.set(def.symbol, {
      priceUsd: parseFloat(row.priceUsd) || 0,
      change1hPct: Number((change24 * 0.15).toFixed(2)),
      change24hPct: Number(change24.toFixed(2)),
      volume24hUsd: parseFloat(row.volumeUsd24Hr) || 0,
      marketCapUsd: parseFloat(row.marketCapUsd) || 0,
      sparkline7d: [],
    });
  }
  return map;
}

export async function getLivePrices(forceRefresh = false): Promise<Map<string, PriceSnapshot>> {
  if (!forceRefresh && cachedPrices && Date.now() - cachedPrices.fetchedAt < PRICE_TTL_MS) {
    return cachedPrices.data;
  }

  let priceMap = new Map<string, PriceSnapshot>();

  try {
    priceMap = await fetchCoinGeckoPrices();
  } catch {
    try {
      priceMap = await fetchBinanceFallbackPrices();
    } catch {
      try {
        priceMap = await fetchCoinCapFallbackPrices();
      } catch {
        if (cachedPrices) return cachedPrices.data;
      }
    }
  }

  // Fill any missing coins from Binance if CoinGecko returned partial data
  if (priceMap.size < TRACKED_COINS.length) {
    try {
      const fallback = await fetchBinanceFallbackPrices();
      for (const [sym, snap] of fallback.entries()) {
        if (!priceMap.has(sym)) {
          priceMap.set(sym, snap);
        }
      }
    } catch {
      // Ignore secondary fallback error
    }
  }

  if (priceMap.size > 0) {
    cachedPrices = { data: priceMap, fetchedAt: Date.now() };
  }
  return priceMap;
}

async function fetchCryptoCompareNews(): Promise<RawFeedArticle[]> {
  const res = await fetchWithTimeout('https://min-api.cryptocompare.com/data/v2/news/?lang=EN', 8000);
  if (!res.ok) throw new Error(`CryptoCompare HTTP ${res.status}`);
  const json = (await res.json()) as {
    Data?: Array<{
      id: string;
      title: string;
      body: string;
      url: string;
      published_on: number;
      source_info?: { name?: string };
      source?: string;
    }>;
  };
  return (json.Data ?? []).slice(0, 30).map((item) => ({
    title: stripHtml(item.title || ''),
    summary: stripHtml(item.body || '').slice(0, 260),
    url: item.url,
    source: item.source_info?.name || item.source || 'CryptoCompare',
    language: 'en' as const,
    publishedAtMs: (item.published_on || Math.floor(Date.now() / 1000)) * 1000,
  }));
}

async function fetchRssFeed(
  feedUrl: string,
  sourceName: string,
  language: 'ru' | 'en'
): Promise<RawFeedArticle[]> {
  const res = await fetchWithTimeout(feedUrl, 8000);
  if (!res.ok) throw new Error(`${sourceName} HTTP ${res.status}`);
  const xml = await res.text();
  const parsed = xmlParser.parse(xml);

  const channelItems = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? [];
  const list = Array.isArray(channelItems) ? channelItems : [channelItems];

  return list
    .filter((item) => item && item.title)
    .slice(0, 18)
    .map((item) => {
      const rawTitle = typeof item.title === 'object' ? item.title['#text'] || '' : String(item.title || '');
      const rawDesc =
        item.description ?? item.summary ?? item['content:encoded'] ?? item.content ?? '';
      const descStr = typeof rawDesc === 'object' ? rawDesc['#text'] || '' : String(rawDesc || '');
      const rawLink =
        typeof item.link === 'object' ? item.link['@_href'] || item.link['#text'] || '' : String(item.link || '');
      const rawDate = item.pubDate ?? item.published ?? item.updated ?? '';
      const parsedMs = rawDate ? Date.parse(String(rawDate)) : Date.now();

      return {
        title: stripHtml(rawTitle),
        summary: stripHtml(descStr).slice(0, 260),
        url: rawLink.trim(),
        source: sourceName,
        language,
        publishedAtMs: Number.isFinite(parsedMs) ? parsedMs : Date.now(),
      };
    });
}

function makeNewsId(url: string, title: string): string {
  let hash = 0;
  const input = `${url}|${title}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return `news_${Math.abs(hash).toString(36)}`;
}

export async function getLiveNews(forceRefresh = false): Promise<{ news: NewsItem[]; sources: string[] }> {
  if (!forceRefresh && cachedNews && Date.now() - cachedNews.fetchedAt < NEWS_TTL_MS) {
    return { news: cachedNews.data, sources: cachedNews.sources };
  }

  const feedTasks = [
    // Russian crypto sources
    { name: 'ForkLog', task: fetchRssFeed('https://forklog.com/feed/', 'ForkLog', 'ru') },
    { name: 'Bits.media', task: fetchRssFeed('https://bits.media/rss/', 'Bits.media', 'ru') },
    { name: 'HappyCoin', task: fetchRssFeed('https://happycoin.club/feed/', 'HappyCoin', 'ru') },
    { name: 'Incrypted', task: fetchRssFeed('https://incrypted.com/feed/', 'Incrypted', 'ru') },
    { name: 'BeInCrypto RU', task: fetchRssFeed('https://ru.beincrypto.com/feed/', 'BeInCrypto RU', 'ru') },
    { name: 'CoinSpot', task: fetchRssFeed('https://coinspot.io/feed/', 'CoinSpot', 'ru') },
    { name: 'BitNovosti', task: fetchRssFeed('https://bitnovosti.com/feed/', 'BitNovosti', 'ru') },
    // Global, DeFi, Security & Institutional sources
    { name: 'CoinDesk', task: fetchRssFeed('https://www.coindesk.com/arc/outboundfeeds/rss/', 'CoinDesk', 'en') },
    { name: 'Cointelegraph', task: fetchRssFeed('https://cointelegraph.com/rss', 'Cointelegraph', 'en') },
    { name: 'Decrypt', task: fetchRssFeed('https://decrypt.co/feed', 'Decrypt', 'en') },
    { name: 'The Block', task: fetchRssFeed('https://www.theblock.co/rss.xml', 'The Block', 'en') },
    { name: 'DL News', task: fetchRssFeed('https://www.dlnews.com/arc/outboundfeeds/rss/', 'DL News', 'en') },
    { name: 'Protos', task: fetchRssFeed('https://protos.com/feed/', 'Protos', 'en') },
    { name: 'Rekt News', task: fetchRssFeed('https://rekt.news/rss/feed.xml', 'Rekt News', 'en') },
    { name: 'CryptoSlate', task: fetchRssFeed('https://cryptoslate.com/feed/', 'CryptoSlate', 'en') },
    { name: 'Blockworks', task: fetchRssFeed('https://blockworks.co/feed', 'Blockworks', 'en') },
    { name: 'CryptoBriefing', task: fetchRssFeed('https://cryptobriefing.com/feed/', 'CryptoBriefing', 'en') },
    { name: 'Bitcoin Magazine', task: fetchRssFeed('https://bitcoinmagazine.com/feed', 'Bitcoin Magazine', 'en') },
    { name: 'AMBCrypto', task: fetchRssFeed('https://ambcrypto.com/feed/', 'AMBCrypto', 'en') },
    { name: 'DailyCoin', task: fetchRssFeed('https://dailycoin.com/feed/', 'DailyCoin', 'en') },
    { name: 'CoinGape', task: fetchRssFeed('https://coingape.com/feed/', 'CoinGape', 'en') },
    { name: 'Bitcoinist', task: fetchRssFeed('https://bitcoinist.com/feed/', 'Bitcoinist', 'en') },
    { name: 'NewsBTC', task: fetchRssFeed('https://www.newsbtc.com/feed/', 'NewsBTC', 'en') },
    { name: 'CryptoPotato', task: fetchRssFeed('https://cryptopotato.com/feed/', 'CryptoPotato', 'en') },
    { name: 'U.Today', task: fetchRssFeed('https://u.today/rss', 'U.Today', 'en') },
    { name: 'Kraken Blog', task: fetchRssFeed('https://blog.kraken.com/feed', 'Kraken Blog', 'en') },
    { name: 'CryptoCompare', task: fetchCryptoCompareNews() },
  ];

  const settled = await Promise.allSettled(feedTasks.map((f) => f.task));
  const rawArticles: RawFeedArticle[] = [];
  const activeSources: string[] = [];

  settled.forEach((result, idx) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      activeSources.push(feedTasks[idx].name);
      rawArticles.push(...result.value);
    }
  });

  if (rawArticles.length === 0 && cachedNews) {
    return { news: cachedNews.data, sources: cachedNews.sources };
  }

  // Deduplicate by normalized title prefix
  const seenTitles = new Set<string>();
  const uniqueArticles: RawFeedArticle[] = [];

  for (const art of rawArticles) {
    if (!art.title || art.title.length < 10) continue;
    const norm = art.title.toLowerCase().replace(/[^a-zа-я0-9]/gi, '').slice(0, 48);
    if (seenTitles.has(norm)) continue;
    seenTitles.add(norm);
    uniqueArticles.push(art);
  }

  // Sort newest first, keeping up to 150 items
  uniqueArticles.sort((a, b) => b.publishedAtMs - a.publishedAtMs);
  const topArticles = uniqueArticles.slice(0, 150);

  const classified: NewsItem[] = topArticles.map((art) => {
    const analysis = classifyTextByKeywords(art.title, art.summary, art.publishedAtMs);
    return {
      id: makeNewsId(art.url, art.title),
      title: art.title,
      summary: art.summary,
      url: art.url,
      source: art.source,
      language: art.language,
      publishedAt: new Date(art.publishedAtMs).toISOString(),
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      impactScore: analysis.impactScore,
      isBreaking: analysis.isBreaking,
      estimatedReactionPct: analysis.estimatedReactionPct,
      matchedKeywords: analysis.matchedKeywords,
      synergies: analysis.synergies,
      coins: analysis.coins,
      coinImpacts: analysis.coinImpacts,
      isNoise: analysis.isNoise,
    };
  });

  cachedNews = {
    data: classified,
    sources: activeSources,
    fetchedAt: Date.now(),
  };

  return { news: classified, sources: activeSources };
}

export async function buildMarketPulse(forceRefresh = false): Promise<MarketPulseResponse> {
  const [priceMap, newsData] = await Promise.all([
    getLivePrices(forceRefresh),
    getLiveNews(forceRefresh),
  ]);

  const { news, sources } = newsData;
  await refineImpactWithGroqBatch(news);
  const clusters = detectNewsResonanceClusters(news);
  const coins = aggregateCoinStates(priceMap, news);
  const alerts = await evaluateAndDispatchAlerts(coins);
  dispatchTopBreakingNewsToTelegram(news, coins).catch(() => {});
  const telegram = getTelegramStatus();

  const bullishCount = news.filter((n) => n.sentiment === 'bullish').length;
  const bearishCount = news.filter((n) => n.sentiment === 'bearish').length;
  const neutralCount = news.filter((n) => n.sentiment === 'neutral').length;
  const breakingCount = news.filter((n) => n.isBreaking).length;

  const avgImpact =
    news.length > 0
      ? Math.round(news.reduce((acc, n) => acc + n.impactScore, 0) / news.length)
      : 0;

  let dominantSentiment: MarketPulseResponse['summary']['dominantSentiment'] = 'neutral';
  if (bullishCount > bearishCount + 2) dominantSentiment = 'bullish';
  else if (bearishCount > bullishCount + 2) dominantSentiment = 'bearish';

  return {
    coins,
    news,
    clusters,
    alerts,
    telegram: {
      configured: telegram.configured,
      subscriberCount: telegram.subscriberCount,
      threshold: telegram.threshold,
    },
    summary: {
      totalNews: news.length,
      bullishCount,
      bearishCount,
      neutralCount,
      breakingCount,
      resonanceWavesCount: clusters.length,
      marketImpactIndex: avgImpact,
      dominantSentiment,
      activeSources: sources,
    },
    updatedAt: new Date().toISOString(),
  };
}
