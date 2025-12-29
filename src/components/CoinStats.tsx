import { CoinData } from '@/lib/api';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from 'lucide-react';

interface CoinStatsProps {
  coin: CoinData | null;
  isLoading?: boolean;
}

function StatItem({ 
  label, 
  value, 
  change,
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <div className="font-mono font-medium">{value}</div>
        {change !== undefined && (
          <div className={cn(
            "text-xs flex items-center justify-end gap-1",
            change >= 0 ? "text-success" : "text-destructive"
          )}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
}

export function CoinStats({ coin, isLoading }: CoinStatsProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between py-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="glass-card p-6">
        <div className="text-center text-muted-foreground py-10">
          Select a coin to view statistics
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(8)}`;
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1e12) return `${(supply / 1e12).toFixed(2)}T`;
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    return supply.toLocaleString();
  };

  const md = coin.market_data;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4 mb-6">
        <img src={coin.image.small} alt={coin.name} className="w-12 h-12 rounded-full" />
        <div>
          <h2 className="text-xl font-bold">{coin.name}</h2>
          <span className="text-muted-foreground uppercase">{coin.symbol}</span>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold font-mono">
            {formatPrice(md.current_price.usd)}
          </div>
          <div className={cn(
            "flex items-center justify-end gap-1 text-sm",
            md.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"
          )}>
            {md.price_change_percentage_24h >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {md.price_change_percentage_24h >= 0 ? '+' : ''}
            {md.price_change_percentage_24h.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <StatItem 
          label="Market Cap" 
          value={formatNumber(md.market_cap.usd)} 
          icon={DollarSign}
        />
        <StatItem 
          label="24h Volume" 
          value={formatNumber(md.total_volume.usd)} 
          icon={BarChart3}
        />
        <StatItem 
          label="24h High" 
          value={formatPrice(md.high_24h.usd)} 
        />
        <StatItem 
          label="24h Low" 
          value={formatPrice(md.low_24h.usd)} 
        />
        <StatItem 
          label="All-Time High" 
          value={formatPrice(md.ath.usd)} 
          change={md.ath_change_percentage.usd}
          icon={Activity}
        />
        <StatItem 
          label="Circulating Supply" 
          value={formatSupply(md.circulating_supply)} 
        />
        {md.total_supply && (
          <StatItem 
            label="Total Supply" 
            value={formatSupply(md.total_supply)} 
          />
        )}
        <StatItem 
          label="7d Change" 
          value="" 
          change={md.price_change_percentage_7d}
        />
        <StatItem 
          label="30d Change" 
          value="" 
          change={md.price_change_percentage_30d}
        />
      </div>
    </div>
  );
}
