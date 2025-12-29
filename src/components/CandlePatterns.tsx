import { PatternResult } from '@/lib/candlePatterns';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface CandlePatternsProps {
  patterns: PatternResult[];
  isLoading?: boolean;
}

export function CandlePatterns({ patterns, isLoading }: CandlePatternsProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Candle Patterns</span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Candle Patterns</span>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No significant patterns detected
        </p>
      </div>
    );
  }

  const getIcon = (type: PatternResult['type']) => {
    switch (type) {
      case 'bullish': return TrendingUp;
      case 'bearish': return TrendingDown;
      default: return Minus;
    }
  };

  const getStyles = (type: PatternResult['type']) => {
    switch (type) {
      case 'bullish':
        return { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success' };
      case 'bearish':
        return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive' };
      default:
        return { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning' };
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Candle Patterns</span>
        <span className="text-xs text-muted-foreground ml-auto">{patterns.length} detected</span>
      </div>

      <div className="space-y-2">
        {patterns.map((pattern, i) => {
          const Icon = getIcon(pattern.type);
          const styles = getStyles(pattern.type);

          return (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border",
                styles.bg, styles.border,
                "animate-fade-in"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("h-4 w-4", styles.text)} />
                <span className="font-medium text-sm">{pattern.name}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full ml-auto",
                  pattern.strength === 'strong' && "bg-primary/20 text-primary",
                  pattern.strength === 'moderate' && "bg-muted text-muted-foreground",
                  pattern.strength === 'weak' && "bg-muted/50 text-muted-foreground/70"
                )}>
                  {pattern.strength}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{pattern.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
