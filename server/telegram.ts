import { GoogleGenAI } from '@google/genai';
import type { AlertEvent, CoinMarketState, NewsItem, SentimentType } from '../src/types/crypto.ts';

export const ALERT_THRESHOLD = Number(process.env.ALERT_THRESHOLD) || 85;
const COOLDOWN_MS = 30 * 60 * 1000;
const NEWS_DEDUPE_MS = 6 * 60 * 60 * 1000;

const subscribers = new Set<string>();
const lastAlertSentAt = new Map<string, number>();
const sentBreakingNewsAt = new Map<string, number>();
const alertHistory: AlertEvent[] = [];

let pollingOffset = 0;
let pollingActive = false;

function getBotToken(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token || token === 'MY_TELEGRAM_BOT_TOKEN') return null;
  return token;
}

function getDefaultChatIds(): string[] {
  const raw = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!raw || raw === 'MY_TELEGRAM_CHAT_ID') return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function getTargetChatIds(): string[] {
  const all = new Set<string>(getDefaultChatIds());
  for (const sub of subscribers) {
    all.add(sub);
  }
  return Array.from(all);
}

function getPublicWebAppUrl(): string | null {
  const raw = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
  if (!raw || raw === 'MY_APP_URL') return null;
  const trimmed = raw.trim().replace(/\/$/, '');
  return trimmed.startsWith('https://') ? trimmed : null;
}

export function getTelegramStatus() {
  const token = getBotToken();
  const chats = getTargetChatIds();
  return {
    configured: Boolean(token && chats.length > 0),
    botTokenPresent: Boolean(token),
    subscriberCount: chats.length,
    threshold: ALERT_THRESHOLD,
  };
}

export function getAlertHistory(): AlertEvent[] {
  return [...alertHistory];
}

function formatPrice(price: number): string {
  if (!price || price <= 0) return '—';
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 5 })}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sentimentBadge(sentiment: SentimentType): string {
  if (sentiment === 'bullish') return '🟢 Бычий сигнал';
  if (sentiment === 'bearish') return '🔴 Медвежий сигнал';
  return '🟡 Сильный импульс';
}

function impactTierLabel(score: number): string {
  if (score >= 90) return '🔴 ЭКСТРЕМАЛЬНЫЙ ШОК';
  if (score >= 85) return '🔥 КРИТИЧЕСКИЙ ИМПУЛЬС';
  if (score >= 70) return '⚡️ СИЛЬНЫЙ СИГНАЛ';
  if (score >= 45) return '📈 ПОВЫШЕННЫЙ ФОН';
  return '• ЛОКАЛЬНЫЙ ФОН';
}

/**
 * Optional free-tier AI digest ONLY for top breaking Telegram posts (>= 85 or 3+ media resonance).
 * Supports free Groq API (GROQ_API_KEY) or Google Gemini API (GEMINI_API_KEY) with zero local RAM cost on Render.
 */
async function getOptionalAiSummaryForTelegram(item: NewsItem): Promise<{
  headlineRu?: string;
  takeawayRu?: string;
} | null> {
  const prompt = `Переведи заголовок на естественный русский (если уже на русском — оставь/улучши) и напиши 1 короткое предложение для криптотрейдера: почему эта новость резко влияет на рынок.
Формат ответа строго 2 строки:
1 строка: Заголовок на русском
2 строка: 1 предложение сути (до 140 символов)

Новость: ${item.title}
Контекст: ${item.summary || ''}`;

  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          max_tokens: 180,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      clearTimeout(t);
      if (res.ok) {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const lines = (json.choices?.[0]?.message?.content || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length >= 2) {
          return { headlineRu: lines[0], takeawayRu: lines[1] };
        }
      }
    } catch {
      // Fall back gracefully
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
      });
      const lines = (response.text ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length >= 2) {
        return { headlineRu: lines[0], takeawayRu: lines[1] };
      }
    } catch {
      // Fall back gracefully
    }
  }

  return null;
}

async function callTelegramApi(method: string, payload: Record<string, unknown>): Promise<unknown> {
  const token = getBotToken();
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN не задан в переменных окружения');

  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as { ok?: boolean; description?: string; result?: unknown };
  if (!res.ok || !json.ok) {
    throw new Error(json.description || `Telegram API HTTP ${res.status}`);
  }
  return json.result;
}

async function sendMessageToChat(
  chatId: string,
  htmlText: string,
  includeWebAppButton = true
): Promise<boolean> {
  const webAppUrl = getPublicWebAppUrl();
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: htmlText,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (includeWebAppButton && webAppUrl) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          {
            text: '📊 Открыть монитор КриптоПульс',
            web_app: { url: webAppUrl },
          },
        ],
      ],
    };
  }

  await callTelegramApi('sendMessage', payload);
  return true;
}

export async function evaluateAndDispatchAlerts(coins: CoinMarketState[]): Promise<AlertEvent[]> {
  const now = Date.now();
  const triggeredCoins = coins.filter((c) => c.impactScore > ALERT_THRESHOLD);
  const targets = getTargetChatIds();
  const token = getBotToken();

  for (const coin of triggeredCoins) {
    const headline = coin.topNewsTitle || `Резкий рыночный импульс по ${coin.symbol}`;
    const dedupeKey = `${coin.symbol}:${headline.slice(0, 60)}`;
    const prevSent = lastAlertSentAt.get(dedupeKey) ?? 0;

    if (now - prevSent < COOLDOWN_MS) {
      continue;
    }

    lastAlertSentAt.set(dedupeKey, now);

    const reactionSign = coin.newsReactionPct > 0 ? '+' : '';
    const msgHtml = [
      `🚨 <b>ИМПУЛЬС ПО МОНЕТЕ · ${escapeHtml(coin.symbol)}</b>`,
      `${impactTierLabel(coin.impactScore)} · <b>${coin.impactScore}/100</b>`,
      ``,
      `<blockquote><b>${escapeHtml(headline)}</b></blockquote>`,
      ``,
      `• Направление: ${sentimentBadge(coin.sentiment)}`,
      `• Ожид. реакция: <b>${reactionSign}${coin.newsReactionPct.toFixed(2)}%</b>`,
      `• Цена сейчас: <code>${formatPrice(coin.priceUsd)}</code> (${coin.change24hPct >= 0 ? '+' : ''}${coin.change24hPct.toFixed(2)}% за 24ч)`,
    ].join('\n');

    let sentToTelegram = false;
    if (token && targets.length > 0) {
      const results = await Promise.allSettled(
        targets.map((chatId) => sendMessageToChat(chatId, msgHtml, true))
      );
      sentToTelegram = results.some((r) => r.status === 'fulfilled');
    }

    const event: AlertEvent = {
      id: `alert_${coin.symbol}_${now}`,
      symbol: coin.symbol,
      nameRu: coin.nameRu,
      priceUsd: coin.priceUsd,
      impactScore: coin.impactScore,
      newsReactionPct: coin.newsReactionPct,
      sentiment: coin.sentiment,
      triggerHeadline: headline,
      triggeredAt: new Date(now).toISOString(),
      sentToTelegram,
    };

    alertHistory.unshift(event);
    if (alertHistory.length > 40) {
      alertHistory.length = 40;
    }
  }

  return getAlertHistory();
}

/**
 * Automatically sends the absolute hottest breaking news (impact >= 85 or 3+ media resonance >= 80)
 * formatted cleanly in Telegram HTML.
 */
export async function dispatchTopBreakingNewsToTelegram(
  news: NewsItem[],
  coins: CoinMarketState[]
): Promise<void> {
  const token = getBotToken();
  const targets = getTargetChatIds();
  if (!token || targets.length === 0) return;

  const now = Date.now();
  const coinMap = new Map(coins.map((c) => [c.symbol, c]));

  // Select top 2 hottest unseen breaking news items per cycle
  const candidates = [...news]
    .filter(
      (n) =>
        n.impactScore >= ALERT_THRESHOLD ||
        ((n.resonanceCount ?? 0) >= 3 && n.impactScore >= 80)
    )
    .sort((a, b) => b.impactScore - a.impactScore);

  let sentInBatch = 0;

  for (const item of candidates) {
    if (sentInBatch >= 2) break;

    const normTitle = item.title.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '').slice(0, 44);
    const prevAt = sentBreakingNewsAt.get(normTitle) ?? 0;
    if (now - prevAt < NEWS_DEDUPE_MS) continue;

    sentBreakingNewsAt.set(normTitle, now);
    sentInBatch++;

    const aiExtra =
      item.aiSummaryRu || item.titleRu
        ? { headlineRu: item.titleRu, takeawayRu: item.aiSummaryRu }
        : await getOptionalAiSummaryForTelegram(item);
    const displayTitle = aiExtra?.headlineRu || item.title;

    const coinLines = item.coinImpacts.slice(0, 3).map((ci) => {
      const live = coinMap.get(ci.symbol);
      const priceStr = live ? formatPrice(live.priceUsd) : '—';
      const sign = ci.estimatedReactionPct > 0 ? '+' : '';
      return `• <b>${escapeHtml(ci.symbol)}</b>: <code>${priceStr}</code> · индекс <b>${ci.impactScore}/100</b> (${sign}${ci.estimatedReactionPct.toFixed(1)}%)`;
    });

    const reactionSign = item.estimatedReactionPct > 0 ? '+' : '';
    const parts: string[] = [
      `${impactTierLabel(item.impactScore)} · <b>${item.impactScore}/100</b>`,
      ``,
      `<blockquote><b>${escapeHtml(displayTitle)}</b></blockquote>`,
    ];

    if (aiExtra?.takeawayRu) {
      parts.push(`💡 <i>${escapeHtml(aiExtra.takeawayRu)}</i>`);
    }

    parts.push(
      ``,
      `• Сигнал: ${sentimentBadge(item.sentiment)}`,
      `• Ожид. реакция: <b>${reactionSign}${item.estimatedReactionPct.toFixed(1)}%</b>`
    );

    if (item.resonanceCount && item.resonanceCount >= 2) {
      parts.push(`• Подтверждение: <b>${item.resonanceCount} СМИ одновременно</b>`);
    }

    if (item.synergies && item.synergies.length > 0) {
      parts.push(`🔗 Связка: <i>${escapeHtml(item.synergies.join(' · '))}</i>`);
    }

    if (coinLines.length > 0) {
      parts.push(``, `<b>Затронутые монеты:</b>`, ...coinLines);
    }

    if (item.matchedKeywords.length > 0) {
      parts.push(
        ``,
        `🏷 Ключевые слова: <i>${escapeHtml(item.matchedKeywords.slice(0, 4).map((k) => k.word).join(' · '))}</i>`
      );
    }

    parts.push(`📰 Источник: <a href="${escapeHtml(item.url)}">${escapeHtml(item.source)}</a>`);

    const html = parts.join('\n');
    await Promise.allSettled(targets.map((chatId) => sendMessageToChat(chatId, html, true)));
  }
}

export async function handleTelegramUpdate(
  update: {
    message?: {
      chat?: { id?: number | string };
      text?: string;
    };
  },
  getLatestCoins: () => Promise<CoinMarketState[]>
): Promise<void> {
  const chatIdRaw = update?.message?.chat?.id;
  const text = (update?.message?.text || '').trim();
  if (!chatIdRaw || !text) return;

  const chatId = String(chatIdRaw);
  const cmd = text.split(/\s+/)[0].toLowerCase();

  if (cmd === '/start' || cmd === '/subscribe') {
    subscribers.add(chatId);
    const welcome = [
      `⚡️ <b>КриптоПульс подключён</b>`,
      ``,
      `Бот автоматически присылает:`,
      `• сигналы, когда индекс влияния по монете превышает <b>${ALERT_THRESHOLD}/100</b>;`,
      `• самые резкие и подтверждённые новости рынка.`,
      ``,
      `<b>Команды:</b>`,
      `/top — текущие цены и монеты с максимальным импульсом`,
      `/stop — отключить уведомления`,
    ].join('\n');
    await sendMessageToChat(chatId, welcome, true);
    return;
  }

  if (cmd === '/stop' || cmd === '/unsubscribe') {
    subscribers.delete(chatId);
    await sendMessageToChat(chatId, 'Уведомления КриптоПульс отключены. Чтобы включить снова, отправьте /start.', false);
    return;
  }

  if (cmd === '/top' || cmd === '/status') {
    const coins = await getLatestCoins();
    const top = [...coins].sort((a, b) => b.impactScore - a.impactScore).slice(0, 6);
    const lines = top.map(
      (c) =>
        `• <b>${escapeHtml(c.symbol)}</b>: <code>${formatPrice(c.priceUsd)}</code> · влияние <b>${c.impactScore}/100</b> (${c.newsReactionPct >= 0 ? '+' : ''}${c.newsReactionPct.toFixed(1)}%)`
    );
    await sendMessageToChat(
      chatId,
      [`📊 <b>Топ монет по влиянию новостей (0–100)</b>`, ``, ...lines].join('\n'),
      true
    );
  }
}

export function startTelegramPolling(getLatestCoins: () => Promise<CoinMarketState[]>): void {
  const token = getBotToken();
  if (!token || pollingActive || process.env.TELEGRAM_USE_WEBHOOK === 'true') {
    return;
  }
  pollingActive = true;

  const poll = async () => {
    try {
      const updates = (await callTelegramApi('getUpdates', {
        offset: pollingOffset,
        timeout: 20,
        allowed_updates: ['message'],
      })) as Array<{ update_id: number; message?: { chat?: { id?: number | string }; text?: string } }>;

      if (Array.isArray(updates)) {
        for (const upd of updates) {
          pollingOffset = Math.max(pollingOffset, upd.update_id + 1);
          await handleTelegramUpdate(upd, getLatestCoins).catch(() => {});
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 4000));
    }
    if (pollingActive) {
      setTimeout(poll, 1000);
    }
  };

  setTimeout(poll, 1500);
}
