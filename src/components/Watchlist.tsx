import { useState, useEffect } from 'react';
import { Star, Trash2, Bell, BellOff, TrendingUp, TrendingDown, X } from 'lucide-react';
import { WatchlistItem, WatchlistWithPrices } from '@/hooks/useWatchlist';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface WatchlistProps {
  watchlist: WatchlistItem[];
  onRemove: (coinId: string) => void;
  onSelect: (coinId: string) => void;
  onSetAlert: (coinId: string, high?: number, low?: number) => void;
  selectedCoin?: string;
}

async function fetchPrices(coinIds: string[]): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
  if (coinIds.length === 0) return {};
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export function Watchlist({ watchlist, onRemove, onSelect, onSetAlert, selectedCoin }: WatchlistProps) {
  const [enriched, setEnriched] = useState<WatchlistWithPrices[]>([]);
  const [alertModal, setAlertModal] = useState<{ coinId: string; high: string; low: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (watchlist.length === 0) {
      setEnriched([]);
      return;
    }

    const updatePrices = async () => {
      setIsLoading(true);
      const prices = await fetchPrices(watchlist.map(w => w.coinId));
      
      const updated = watchlist.map(item => {
        const priceData = prices[item.coinId];
        const currentPrice = priceData?.usd;
        const pnl = currentPrice ? currentPrice - item.addedPrice : undefined;
        const pnlPercent = currentPrice && item.addedPrice ? ((currentPrice - item.addedPrice) / item.addedPrice) * 100 : undefined;
        
        // Check alerts
        if (currentPrice && item.alertHigh && currentPrice >= item.alertHigh) {
          toast({
            title: `${item.symbol.toUpperCase()} Alert!`,
            description: `Price reached $${currentPrice.toFixed(2)} (above $${item.alertHigh})`,
          });
        }
        if (currentPrice && item.alertLow && currentPrice <= item.alertLow) {
          toast({
            title: `${item.symbol.toUpperCase()} Alert!`,
            description: `Price dropped to $${currentPrice.toFixed(2)} (below $${item.alertLow})`,
          });
        }
        
        return {
          ...item,
          currentPrice,
          priceChange24h: priceData?.usd_24h_change,
          pnl,
          pnlPercent,
        };
      });
      
      setEnriched(updated);
      setIsLoading(false);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [watchlist]);

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    if (price >= 1) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(6)}`;
  };

  const handleSaveAlert = () => {
    if (!alertModal) return;
    const high = alertModal.high ? parseFloat(alertModal.high) : undefined;
    const low = alertModal.low ? parseFloat(alertModal.low) : undefined;
    onSetAlert(alertModal.coinId, high, low);
    setAlertModal(null);
    toast({ title: 'Alert set!', description: 'You will be notified when price thresholds are reached.' });
  };

  if (watchlist.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Watchlist</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Star className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No coins in watchlist</p>
          <p className="text-xs mt-1">Click the star on any coin to add it</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <h3 className="font-semibold">Watchlist</h3>
          </div>
          <span className="text-xs text-muted-foreground">{watchlist.length} coins</span>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {enriched.map((item) => (
            <div
              key={item.coinId}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                "hover:bg-secondary/50",
                selectedCoin === item.coinId && "bg-primary/10 border border-primary/30"
              )}
              onClick={() => onSelect(item.coinId)}
            >
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground uppercase">{item.symbol}</div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm">
                  {isLoading ? (
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    formatPrice(item.currentPrice)
                  )}
                </div>
                {item.pnlPercent !== undefined && (
                  <div className={cn(
                    "text-xs flex items-center justify-end gap-1",
                    item.pnlPercent >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {item.pnlPercent >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAlertModal({
                      coinId: item.coinId,
                      high: item.alertHigh?.toString() || '',
                      low: item.alertLow?.toString() || '',
                    });
                  }}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    item.alertHigh || item.alertLow
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.alertHigh || item.alertLow ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.coinId);
                  }}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {enriched.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total P/L</span>
              {(() => {
                const totalPnl = enriched.reduce((acc, item) => acc + (item.pnl || 0), 0);
                const isPositive = totalPnl >= 0;
                return (
                  <span className={cn("font-mono", isPositive ? "text-success" : "text-destructive")}>
                    {isPositive ? '+' : ''}{formatPrice(Math.abs(totalPnl))}
                  </span>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-6 w-full max-w-sm mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Set Price Alert</h3>
              <button onClick={() => setAlertModal(null)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Alert when above ($)</label>
                <input
                  type="number"
                  value={alertModal.high}
                  onChange={(e) => setAlertModal({ ...alertModal, high: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Alert when below ($)</label>
                <input
                  type="number"
                  value={alertModal.low}
                  onChange={(e) => setAlertModal({ ...alertModal, low: e.target.value })}
                  placeholder="e.g. 40000"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSaveAlert}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Save Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
