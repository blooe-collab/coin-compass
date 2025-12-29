import { TechnicalIndicators } from '@/lib/technicalAnalysis';
import { cn } from '@/lib/utils';

interface IndicatorsPanelProps {
  indicators: TechnicalIndicators | null;
  currentPrice?: number;
  isLoading?: boolean;
}

function IndicatorCard({ 
  label, 
  value, 
  subValue,
  status 
}: { 
  label: string; 
  value: string; 
  subValue?: string;
  status?: 'bullish' | 'bearish' | 'neutral';
}) {
  return (
    <div className="glass-card p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={cn(
        "text-lg font-mono font-semibold",
        status === 'bullish' && "text-success",
        status === 'bearish' && "text-destructive",
        status === 'neutral' && "text-warning"
      )}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );
}

export function IndicatorsPanel({ indicators, currentPrice, isLoading }: IndicatorsPanelProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-3 w-16 bg-muted rounded mb-2" />
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!indicators) {
    return null;
  }

  const getRSIStatus = (rsi: number) => {
    if (rsi < 30) return 'bullish';
    if (rsi > 70) return 'bearish';
    return 'neutral';
  };

  const getMACDStatus = (histogram: number) => {
    if (histogram > 0) return 'bullish';
    if (histogram < 0) return 'bearish';
    return 'neutral';
  };

  const getSMAStatus = (price: number, sma: number) => {
    if (price > sma) return 'bullish';
    if (price < sma) return 'bearish';
    return 'neutral';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Technical Indicators</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <IndicatorCard
          label="RSI (14)"
          value={indicators.rsi.toFixed(2)}
          subValue={indicators.rsi < 30 ? 'Oversold' : indicators.rsi > 70 ? 'Overbought' : 'Neutral'}
          status={getRSIStatus(indicators.rsi)}
        />
        
        <IndicatorCard
          label="MACD"
          value={indicators.macd.macdLine.toFixed(4)}
          subValue={`Signal: ${indicators.macd.signalLine.toFixed(4)}`}
          status={getMACDStatus(indicators.macd.histogram)}
        />
        
        <IndicatorCard
          label="SMA (20)"
          value={formatPrice(indicators.sma20)}
          subValue={currentPrice && currentPrice > indicators.sma20 ? 'Above' : 'Below'}
          status={currentPrice ? getSMAStatus(currentPrice, indicators.sma20) : 'neutral'}
        />
        
        <IndicatorCard
          label="SMA (50)"
          value={formatPrice(indicators.sma50)}
          subValue={currentPrice && currentPrice > indicators.sma50 ? 'Above' : 'Below'}
          status={currentPrice ? getSMAStatus(currentPrice, indicators.sma50) : 'neutral'}
        />
        
        <IndicatorCard
          label="EMA (12)"
          value={formatPrice(indicators.ema12)}
          status={indicators.ema12 > indicators.ema26 ? 'bullish' : 'bearish'}
        />
        
        <IndicatorCard
          label="EMA (26)"
          value={formatPrice(indicators.ema26)}
          status={indicators.ema12 > indicators.ema26 ? 'bullish' : 'bearish'}
        />
        
        <IndicatorCard
          label="Support"
          value={formatPrice(indicators.support)}
          status="bullish"
        />
        
        <IndicatorCard
          label="Resistance"
          value={formatPrice(indicators.resistance)}
          status="bearish"
        />
      </div>
      
      <div className="glass-card p-4">
        <div className="text-xs text-muted-foreground mb-2">Bollinger Bands (20, 2)</div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Lower</div>
            <div className="font-mono text-success">{formatPrice(indicators.bollingerBands.lower)}</div>
          </div>
          <div className="flex-1 h-2 bg-muted rounded-full relative">
            <div 
              className="absolute inset-y-0 bg-gradient-to-r from-success via-warning to-destructive rounded-full opacity-50"
              style={{ left: '10%', right: '10%' }}
            />
            {currentPrice && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background"
                style={{ 
                  left: `${Math.min(90, Math.max(10, 
                    ((currentPrice - indicators.bollingerBands.lower) / 
                    (indicators.bollingerBands.upper - indicators.bollingerBands.lower)) * 80 + 10
                  ))}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Upper</div>
            <div className="font-mono text-destructive">{formatPrice(indicators.bollingerBands.upper)}</div>
          </div>
        </div>
        <div className="text-center mt-2">
          <div className="text-xs text-muted-foreground">Middle</div>
          <div className="font-mono text-warning">{formatPrice(indicators.bollingerBands.middle)}</div>
        </div>
      </div>
    </div>
  );
}
