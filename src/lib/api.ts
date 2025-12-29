// CoinGecko Free API - unlimited free historical OHLCV data
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        await delay(1000 * (i + 1));
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  large: string;
  market_cap_rank: number;
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    atl: { usd: number };
    circulating_supply: number;
    total_supply: number;
  };
  description: { en: string };
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetchWithRetry(
      `${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    return (data.coins || []).slice(0, 10).map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol?.toUpperCase(),
      thumb: coin.thumb || '',
      large: coin.large || '',
      market_cap_rank: coin.market_cap_rank || 0,
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getCoinData(coinId: string): Promise<CoinData | null> {
  try {
    const response = await fetchWithRetry(
      `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
    );

    if (!response.ok) throw new Error('Failed to fetch coin data');

    const coin = await response.json();

    return {
      id: coin.id,
      symbol: coin.symbol?.toUpperCase(),
      name: coin.name,
      image: {
        large: coin.image?.large || '',
        small: coin.image?.small || '',
        thumb: coin.image?.thumb || '',
      },
      market_data: {
        current_price: { usd: coin.market_data?.current_price?.usd || 0 },
        market_cap: { usd: coin.market_data?.market_cap?.usd || 0 },
        total_volume: { usd: coin.market_data?.total_volume?.usd || 0 },
        price_change_percentage_24h: coin.market_data?.price_change_percentage_24h || 0,
        price_change_percentage_7d: coin.market_data?.price_change_percentage_7d || 0,
        price_change_percentage_30d: coin.market_data?.price_change_percentage_30d || 0,
        high_24h: { usd: coin.market_data?.high_24h?.usd || 0 },
        low_24h: { usd: coin.market_data?.low_24h?.usd || 0 },
        ath: { usd: coin.market_data?.ath?.usd || 0 },
        ath_change_percentage: { usd: coin.market_data?.ath_change_percentage?.usd || 0 },
        atl: { usd: coin.market_data?.atl?.usd || 0 },
        circulating_supply: coin.market_data?.circulating_supply || 0,
        total_supply: coin.market_data?.total_supply || 0,
      },
      description: { en: coin.description?.en || '' },
    };
  } catch (error) {
    console.error('Coin data error:', error);
    return null;
  }
}

export async function getPriceHistory(coinId: string, days: number = 30): Promise<PriceHistory | null> {
  try {
    const response = await fetchWithRetry(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) throw new Error('Failed to fetch price history');

    const data = await response.json();

    return {
      prices: data.prices || [],
      market_caps: data.market_caps || [],
      total_volumes: data.total_volumes || [],
    };
  } catch (error) {
    console.error('Price history error:', error);
    return null;
  }
}

export async function getTrendingCoins(): Promise<CoinSearchResult[]> {
  try {
    const response = await fetchWithRetry(`${COINGECKO_BASE}/search/trending`);

    if (!response.ok) throw new Error('Failed to fetch trending');

    const data = await response.json();
    return (data.coins || []).slice(0, 10).map((item: any) => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol?.toUpperCase(),
      thumb: item.item.thumb || '',
      large: item.item.large || '',
      market_cap_rank: item.item.market_cap_rank || 0,
    }));
  } catch (error) {
    console.error('Trending error:', error);
    return [];
  }
}

export async function getOHLCData(coinId: string, days: number = 30): Promise<any[]> {
  try {
    const response = await fetchWithRetry(
      `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );

    if (!response.ok) throw new Error('Failed to fetch OHLC data');

    const data = await response.json();
    
    // CoinGecko returns [timestamp, open, high, low, close]
    return (data || []).map((candle: number[]) => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
    }));
  } catch (error) {
    console.error('OHLC data error:', error);
    return [];
  }
}
