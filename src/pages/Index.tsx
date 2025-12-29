import { useState, useEffect } from 'react';
import { CoinSearch } from '@/components/CoinSearch';
import { PriceChart } from '@/components/PriceChart';
import { SignalCard } from '@/components/SignalCard';
import { IndicatorsPanel } from '@/components/IndicatorsPanel';
import { CoinStats } from '@/components/CoinStats';
import { TimeframeSelector } from '@/components/TimeframeSelector';
import { getCoinData, getPriceHistory, CoinData, PriceHistory } from '@/lib/api';
import { calculateIndicators, generateSignal, TechnicalIndicators, Signal } from '@/lib/technicalAnalysis';
import { Activity, BarChart2, Zap } from 'lucide-react';

const Index = () => {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [timeframe, setTimeframe] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 glow-primary">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedCoin ? (
          // Landing state
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
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
              RSI, MACD, Bollinger Bands, and trading signals.
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Real-time Data</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                <span>Auto Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-accent" />
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        ) : (
          // Analysis view
          <div className="space-y-6 animate-fade-in">
            {/* Timeframe selector */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">
                {coinData?.name || 'Loading...'} Analysis
              </h2>
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <SignalCard signal={signal} isLoading={isLoading} />
                <CoinStats coin={coinData} isLoading={isLoading} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Data provided by CoinGecko</span>
            <span>Built with Lovable</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
