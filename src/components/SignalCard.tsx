import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Signal } from '@/lib/technicalAnalysis';
import { cn } from '@/lib/utils';

interface SignalCardProps {
  signal: Signal | null;
  isLoading?: boolean;
}

export function SignalCard({ signal, isLoading }: SignalCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Analyzing...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <span className="text-muted-foreground">Select a coin to see analysis</span>
          </div>
        </div>
      </div>
    );
  }

  const getSignalStyles = () => {
    switch (signal.type) {
      case 'BUY':
        return {
          bg: 'bg-success/10',
          border: 'border-success/30',
          text: 'text-success',
          glow: 'glow-success',
          icon: TrendingUp,
        };
      case 'SELL':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          text: 'text-destructive',
          glow: 'glow-destructive',
          icon: TrendingDown,
        };
      default:
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          text: 'text-warning',
          glow: '',
          icon: Minus,
        };
    }
  };

  const styles = getSignalStyles();
  const Icon = styles.icon;

  return (
    <div className={cn("glass-card p-6 border", styles.border)}>
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", styles.bg, styles.glow)}>
          <Icon className={cn("h-8 w-8", styles.text)} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("text-3xl font-bold", styles.text)}>
              {signal.type}
            </span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              signal.strength === 'STRONG' && "bg-primary/20 text-primary",
              signal.strength === 'MODERATE' && "bg-muted text-muted-foreground",
              signal.strength === 'WEAK' && "bg-muted/50 text-muted-foreground/70"
            )}>
              {signal.strength}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Signal Score</span>
              <span className={cn("font-mono font-bold", styles.text)}>
                {signal.score > 0 ? '+' : ''}{signal.score}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  signal.score >= 0 ? "bg-success" : "bg-destructive"
                )}
                style={{
                  width: `${Math.abs(signal.score)}%`,
                  marginLeft: signal.score < 0 ? `${100 - Math.abs(signal.score)}%` : '0',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Analysis Factors</h4>
        <ul className="space-y-1">
          {signal.reasons.map((reason, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", styles.bg, styles.text)} />
              <span className="text-foreground/80">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
