import { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { getPriceHistory } from '@/lib/api';
import { calculateIndicators, generateSignal, Signal } from '@/lib/technicalAnalysis';
import { cn } from '@/lib/utils';

interface MultiTimeframeSignalsProps {
  coinId: string | null;
}

interface TimeframeSignal {
  label: string;
  days: number;
  signal: Signal | null;
  isLoading: boolean;
}

const TIMEFRAMES = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export function MultiTimeframeSignals({ coinId }: MultiTimeframeSignalsProps) {
  const [signals, setSignals] = useState<TimeframeSignal[]>(
    TIMEFRAMES.map(tf => ({ ...tf, signal: null, isLoading: false }))
  );

  useEffect(() => {
    if (!coinId) {
      setSignals(TIMEFRAMES.map(tf => ({ ...tf, signal: null, isLoading: false })));
      return;
    }

    const fetchAllSignals = async () => {
      // Set all to loading
      setSignals(TIMEFRAMES.map(tf => ({ ...tf, signal: null, isLoading: true })));

      // Fetch in parallel
      const results = await Promise.all(
        TIMEFRAMES.map(async (tf) => {
          try {
            const history = await getPriceHistory(coinId, tf.days);
            if (history && history.prices.length > 0) {
              const indicators = calculateIndicators(history.prices);
              const currentPrice = history.prices[history.prices.length - 1][1];
              const signal = generateSignal(indicators, currentPrice);
              return { ...tf, signal, isLoading: false };
            }
          } catch (e) {
            console.error(`Failed to fetch ${tf.label}:`, e);
          }
          return { ...tf, signal: null, isLoading: false };
        })
      );

      setSignals(results);
    };

    fetchAllSignals();
  }, [coinId]);

  const getSignalStyles = (signal: Signal | null) => {
    if (!signal) return { bg: 'bg-muted', text: 'text-muted-foreground', icon: Minus };
    switch (signal.type) {
      case 'BUY':
        return { bg: 'bg-success/20', text: 'text-success', icon: TrendingUp };
      case 'SELL':
        return { bg: 'bg-destructive/20', text: 'text-destructive', icon: TrendingDown };
      default:
        return { bg: 'bg-warning/20', text: 'text-warning', icon: Minus };
    }
  };

  // Calculate consensus
  const validSignals = signals.filter(s => s.signal);
  const buyCount = validSignals.filter(s => s.signal?.type === 'BUY').length;
  const sellCount = validSignals.filter(s => s.signal?.type === 'SELL').length;
  const consensus = buyCount > sellCount ? 'BULLISH' : sellCount > buyCount ? 'BEARISH' : 'NEUTRAL';
  const consensusStyles = consensus === 'BULLISH' 
    ? { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' }
    : consensus === 'BEARISH'
    ? { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' }
    : { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' };

  if (!coinId) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Multi-Timeframe Analysis</span>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Select a coin to compare signals
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Multi-Timeframe Analysis</span>
      </div>

      {/* Signal Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {signals.map((tf) => {
          const styles = getSignalStyles(tf.signal);
          const Icon = styles.icon;

          return (
            <div
              key={tf.label}
              className={cn(
                "p-3 rounded-lg text-center transition-all",
                styles.bg
              )}
            >
              <div className="text-xs text-muted-foreground mb-1">{tf.label}</div>
              {tf.isLoading ? (
                <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Icon className={cn("h-5 w-5 mx-auto", styles.text)} />
                  <div className={cn("text-xs font-medium mt-1", styles.text)}>
                    {tf.signal?.type || '-'}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Consensus */}
      {validSignals.length > 0 && (
        <div className={cn(
          "p-3 rounded-lg border text-center",
          consensusStyles.bg, consensusStyles.border
        )}>
          <div className="text-xs text-muted-foreground mb-1">Overall Consensus</div>
          <div className={cn("text-lg font-bold", consensusStyles.text)}>
            {consensus}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {buyCount} Buy · {signals.filter(s => s.signal?.type === 'HOLD').length} Hold · {sellCount} Sell
          </div>
        </div>
      )}
    </div>
  );
}
