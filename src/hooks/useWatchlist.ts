import { useState, useEffect, useCallback } from 'react';

export interface WatchlistItem {
  coinId: string;
  name: string;
  symbol: string;
  image: string;
  addedPrice: number;
  addedAt: number;
  alertHigh?: number;
  alertLow?: number;
}

export interface WatchlistWithPrices extends WatchlistItem {
  currentPrice?: number;
  priceChange24h?: number;
  pnl?: number;
  pnlPercent?: number;
}

const STORAGE_KEY = 'crypto_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load watchlist:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    setWatchlist(prev => {
      if (prev.find(w => w.coinId === item.coinId)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const removeFromWatchlist = useCallback((coinId: string) => {
    setWatchlist(prev => prev.filter(w => w.coinId !== coinId));
  }, []);

  const isInWatchlist = useCallback((coinId: string) => {
    return watchlist.some(w => w.coinId === coinId);
  }, [watchlist]);

  const setAlert = useCallback((coinId: string, alertHigh?: number, alertLow?: number) => {
    setWatchlist(prev => prev.map(w => 
      w.coinId === coinId ? { ...w, alertHigh, alertLow } : w
    ));
  }, []);

  const clearAlerts = useCallback((coinId: string) => {
    setWatchlist(prev => prev.map(w => 
      w.coinId === coinId ? { ...w, alertHigh: undefined, alertLow: undefined } : w
    ));
  }, []);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    setAlert,
    clearAlerts,
    isLoaded,
  };
}
