import { useState, useEffect, useMemo } from 'react';
import { CoinSearch } from '@/components/CoinSearch';
import { PriceChart } from '@/components/PriceChart';
import { SignalCard } from '@/components/SignalCard';
import { IndicatorsPanel } from '@/components/IndicatorsPanel';
import { CoinStats } from '@/components/CoinStats';
import { TimeframeSelector } from '@/components/TimeframeSelector';
import { TrendingCarousel } from '@/components/TrendingCarousel';
import { Watchlist } from '@/components/Watchlist';
import { CandlePatterns } from '@/components/CandlePatterns';
import { MultiTimeframeSignals } from '@/components/MultiTimeframeSignals';
import { getCoinData, getPriceHistory, CoinData, PriceHistory } from '@/lib/api';
import { calculateIndicators, generateSignal, TechnicalIndicators, Signal } from '@/lib/technicalAnalysis';
import { pricesToCandles, detectPatterns, PatternResult } from '@/lib/candlePatterns';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Activity, BarChart2, Zap, Star, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [patterns, setPatterns] = useState<PatternResult[]>([]);
  const [timeframe, setTimeframe] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, setAlert } = useWatchlist();

  useEffect(() => {
    if (!selectedCoin) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      const [coin, history] = await Promise.all([
        getCoinData(selectedCoin),
        getPriceHistory(selectedCoin, timeframe),
      ]);

      setCoinData(coin);
      setPriceHistory(history);

      if (history && history.prices.length > 0) {
        const calculatedIndicators = calculateIndicators(history.prices);
        setIndicators(calculatedIndicators);
        
        const currentPrice = history.prices[history.prices.length - 1][1];
        const generatedSignal = generateSignal(calculatedIndicators, currentPrice);
        setSignal(generatedSignal);

        // Detect candle patterns
        const candles = pricesToCandles(history.prices, 30);
        const detectedPatterns = detectPatterns(candles);
        setPatterns(detectedPatterns);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [selectedCoin, timeframe]);

  const handleCoinSelect = (coinId: string) => {
    setSelectedCoin(coinId);
    setCoinData(null);
    setPriceHistory(null);
    setIndicators(null);
    setSignal(null);
    setPatterns([]);
  };

  const handleToggleWatchlist = () => {
    if (!coinData) return;
    
    if (isInWatchlist(coinData.id)) {
      removeFromWatchlist(coinData.id);
    } else {
      addToWatchlist({
        coinId: coinData.id,
        name: coinData.name,
        symbol: coinData.symbol,
        image: coinData.image.small,
        addedPrice: coinData.market_data.current_price.usd,
      });
    }
  };

  const inWatchlist = selectedCoin ? isInWatchlist(selectedCoin) : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 glow-primary animate-pulse-glow">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">CryptoAnalyzer</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Technical Analysis</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-xl">
              <CoinSearch onSelectCoin={handleCoinSelect} selectedCoin={selectedCoin || undefined} />
            </div>

            {coinData && (
              <button
                onClick={handleToggleWatchlist}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  inWatchlist 
                    ? "bg-primary/20 text-primary glow-primary" 
                    : "bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
              >
                <Star className={cn("h-5 w-5", inWatchlist && "fill-current")} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative">
        {!selectedCoin ? (
          // Landing state
          <div className="space-y-8">
            {/* Hero */}
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
              <div className="mb-8 animate-float">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 glow-primary">
                  <BarChart2 className="h-20 w-20 text-primary" />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gradient">Technical Analysis</span>
                <br />
                Made Simple
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-lg mb-8">
                Search any cryptocurrency and get instant AI-powered analysis with 
                RSI, MACD, Bollinger Bands, candle patterns, and trading signals.
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-success" />
                  <span>Auto Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  <span>Multi-Timeframe</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-warning" />
                  <span>Pattern Detection</span>
                </div>
              </div>
            </div>

            {/* Trending Carousel */}
            <TrendingCarousel onSelectCoin={handleCoinSelect} />

            {/* Watchlist Preview */}
            {watchlist.length > 0 && (
              <div className="max-w-md mx-auto animate-fade-in">
                <Watchlist
                  watchlist={watchlist}
                  onRemove={removeFromWatchlist}
                  onSelect={handleCoinSelect}
                  onSetAlert={setAlert}
                  selectedCoin={selectedCoin || undefined}
                />
              </div>
            )}
          </div>
        ) : (
          // Analysis view
          <div className="space-y-6 animate-fade-in">
            {/* Timeframe selector */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {coinData && (
                  <img src={coinData.image.small} alt={coinData.name} className="w-8 h-8 rounded-full" />
                )}
                <h2 className="text-2xl font-bold">
                  {coinData?.name || 'Loading...'} Analysis
                </h2>
                {coinData && (
                  <button
                    onClick={handleToggleWatchlist}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      inWatchlist ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Star className={cn("h-4 w-4", inWatchlist && "fill-current")} />
                  </button>
                )}
              </div>
              <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Chart - spans 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                <PriceChart 
                  priceData={priceHistory?.prices || []} 
                  indicators={indicators || undefined}
                  isLoading={isLoading}
                />
                
                <IndicatorsPanel 
                  indicators={indicators} 
                  currentPrice={coinData?.market_data.current_price.usd}
                  isLoading={isLoading}
                />

                {/* Candle Patterns */}
                <CandlePatterns patterns={patterns} isLoading={isLoading} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <SignalCard signal={signal} isLoading={isLoading} />
                
                {/* Multi-Timeframe */}
                <MultiTimeframeSignals coinId={selectedCoin} />
                
                <CoinStats coin={coinData} isLoading={isLoading} />

                {/* Watchlist */}
                {watchlist.length > 0 && (
                  <Watchlist
                    watchlist={watchlist}
                    onRemove={removeFromWatchlist}
                    onSelect={handleCoinSelect}
                    onSetAlert={setAlert}
                    selectedCoin={selectedCoin}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
            <span>Data provided by CoinGecko (Free API)</span>
            <span>Built by blooe</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
