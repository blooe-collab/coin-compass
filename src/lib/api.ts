// CoinGecko Free API (no key required)
const BASE_URL = 'https://api.coingecko.com/api/v3';

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
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return data.coins?.slice(0, 10) || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getCoinData(coinId: string): Promise<CoinData | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
    );
    if (!response.ok) throw new Error('Failed to fetch coin data');
    return await response.json();
  } catch (error) {
    console.error('Coin data error:', error);
    return null;
  }
}

export async function getPriceHistory(coinId: string, days: number = 30): Promise<PriceHistory | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    if (!response.ok) throw new Error('Failed to fetch price history');
    return await response.json();
  } catch (error) {
    console.error('Price history error:', error);
    return null;
  }
}

export async function getTrendingCoins(): Promise<CoinSearchResult[]> {
  try {
    const response = await fetch(`${BASE_URL}/search/trending`);
    if (!response.ok) throw new Error('Failed to fetch trending');
    const data = await response.json();
    return data.coins?.map((c: any) => c.item) || [];
  } catch (error) {
    console.error('Trending error:', error);
    return [];
  }
}
