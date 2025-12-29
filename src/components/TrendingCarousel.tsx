import { useState, useEffect, useRef } from 'react';
import { TrendingUp, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { getTrendingCoins, CoinSearchResult } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TrendingCarouselProps {
  onSelectCoin: (coinId: string) => void;
}

export function TrendingCarousel({ onSelectCoin }: TrendingCarouselProps) {
  const [trending, setTrending] = useState<CoinSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      const coins = await getTrendingCoins();
      setTrending(coins);
      setIsLoading(false);
    };
    fetchTrending();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-warning animate-pulse" />
          <span className="font-medium">Trending</span>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <div className="glass-card p-4 relative group">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-warning" />
        <span className="font-medium">Trending Now</span>
        <span className="text-xs text-muted-foreground ml-auto">Scroll to explore</span>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 translate-y-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 translate-y-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {trending.map((coin, index) => (
          <button
            key={coin.id}
            onClick={() => onSelectCoin(coin.id)}
            className={cn(
              "flex-shrink-0 p-4 rounded-xl border border-border/50",
              "bg-gradient-to-br from-secondary/50 to-muted/30",
              "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
              "transition-all duration-300 hover:scale-105",
              "min-w-[140px] text-left group/card"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src={coin.thumb}
                alt={coin.name}
                className="w-6 h-6 rounded-full ring-2 ring-primary/20 group-hover/card:ring-primary/50 transition-all"
              />
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
            </div>
            <div className="font-medium truncate text-sm">{coin.name}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
              <TrendingUp className="h-3 w-3 text-success ml-auto" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
