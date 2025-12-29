import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, X } from 'lucide-react';
import { searchCoins, getTrendingCoins, CoinSearchResult } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CoinSearchProps {
  onSelectCoin: (coinId: string) => void;
  selectedCoin?: string;
}

export function CoinSearch({ onSelectCoin, selectedCoin }: CoinSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [trending, setTrending] = useState<CoinSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTrendingCoins().then(setTrending);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        const coins = await searchCoins(query);
        setResults(coins);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (coin: CoinSearchResult) => {
    onSelectCoin(coin.id);
    setQuery('');
    setIsOpen(false);
  };

  const displayResults = query.trim() ? results : trending;
  const showTrending = !query.trim() && trending.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any cryptocurrency..."
          className={cn(
            "w-full pl-12 pr-12 py-4 rounded-2xl",
            "bg-secondary/50 border border-border/50",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "transition-all duration-300",
            isOpen && "ring-2 ring-primary/30"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50 animate-slide-up">
          {showTrending && (
            <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Trending</span>
            </div>
          )}
          
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="inline-block h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayResults.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {displayResults.map((coin) => (
                <li key={coin.id}>
                  <button
                    onClick={() => handleSelect(coin)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3",
                      "hover:bg-secondary/50 transition-colors",
                      selectedCoin === coin.id && "bg-primary/10"
                    )}
                  >
                    <img
                      src={coin.thumb}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-sm text-muted-foreground uppercase">
                        {coin.symbol}
                      </div>
                    </div>
                    {coin.market_cap_rank && (
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        #{coin.market_cap_rank}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className="p-4 text-center text-muted-foreground">
              No coins found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
