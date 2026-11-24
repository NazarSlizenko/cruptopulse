export type SentimentType = 'bullish' | 'bearish' | 'neutral';

export interface MatchedKeyword {
  word: string;
  polarity: 'bullish' | 'bearish' | 'shock';
  weight: number;
}

export interface CoinImpactBreakdown {
  symbol: string;
  impactScore: number; // 0 to 100
  estimatedReactionPct: number; // e.g. +3.4 or -5.1
  sentiment: SentimentType;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  language: 'ru' | 'en';
  publishedAt: string; // ISO string
  sentiment: SentimentType;
  sentimentScore: number; // negative = bearish, positive = bullish
  impactScore: number; // 0 to 100
  isBreaking: boolean; // impactScore >= 70
  estimatedReactionPct: number; // signed percentage reaction estimate
  matchedKeywords: MatchedKeyword[];
  synergies?: string[]; // detected causal connections between co-occurring keywords
  coins: string[]; // matched coin symbols e.g. ['BTC', 'ETH']
  coinImpacts: CoinImpactBreakdown[];
  resonanceCount?: number; // number of distinct sources covering this similar event simultaneously
  titleRu?: string; // optional Russian headline refined by Groq
  aiSummaryRu?: string; // optional concise 1-sentence trader summary by Groq
  isNoise?: boolean; // true for memecoin/microcap/clickbait noise
}

export interface NewsCluster {
  id: string;
  topicTitle: string;
  sources: string[];
  sourceCount: number;
  articleCount: number;
  sentiment: SentimentType;
  impactScore: number; // 0 to 100 boosted by multi-source confirmation
  estimatedReactionPct: number;
  coins: string[];
  keywords: string[];
  synergies?: string[];
  latestAt: string;
  signalMeaning: string;
}

export interface AlertEvent {
  id: string;
  symbol: string;
  nameRu: string;
  priceUsd: number;
  impactScore: number; // > 85
  newsReactionPct: number;
  sentiment: SentimentType;
  triggerHeadline: string;
  triggeredAt: string;
  sentToTelegram: boolean;
}

export interface CoinMarketState {
  id: string;
  symbol: string;
  name: string;
  nameRu: string;
  priceUsd: number;
  change1hPct: number;
  change24hPct: number;
  volume24hUsd: number;
  marketCapUsd: number;
  sparkline7d: number[];
  // Aggregated news impact metrics
  impactScore: number; // 0 to 100
  maxNewsImpact: number; // highest single news impact hitting this coin (0-100)
  newsReactionPct: number; // calculated news-driven price reaction %
  sentiment: SentimentType;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  breakingCount: number;
  topNewsId?: string;
  topNewsTitle?: string;
  topKeywords: string[];
}

export interface MarketPulseResponse {
  coins: CoinMarketState[];
  news: NewsItem[];
  clusters: NewsCluster[];
  alerts: AlertEvent[];
  telegram: {
    configured: boolean;
    subscriberCount: number;
    threshold: number;
  };
  summary: {
    totalNews: number;
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    breakingCount: number;
    resonanceWavesCount: number;
    marketImpactIndex: number; // 0-100 overall market news intensity
    dominantSentiment: SentimentType;
    activeSources: string[];
  };
  updatedAt: string;
}
