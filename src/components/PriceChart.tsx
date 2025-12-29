import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TechnicalIndicators } from '@/lib/technicalAnalysis';
import { format } from 'date-fns';

interface PriceChartProps {
  priceData: [number, number][];
  indicators?: TechnicalIndicators;
  isLoading?: boolean;
}

export function PriceChart({ priceData, indicators, isLoading }: PriceChartProps) {
  const chartData = useMemo(() => {
    return priceData.map(([timestamp, price]) => ({
      date: timestamp,
      price,
      sma20: indicators?.sma20,
      sma50: indicators?.sma50,
    }));
  }, [priceData, indicators]);

  const priceChange = useMemo(() => {
    if (priceData.length < 2) return 0;
    const first = priceData[0][1];
    const last = priceData[priceData.length - 1][1];
    return ((last - first) / first) * 100;
  }, [priceData]);

  const isPositive = priceChange >= 0;

  if (isLoading) {
    return (
      <div className="glass-card p-6 h-80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading chart data...</span>
        </div>
      </div>
    );
  }

  if (!priceData.length) {
    return (
      <div className="glass-card p-6 h-80 flex items-center justify-center">
        <span className="text-muted-foreground">Select a coin to view price chart</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 84%, 60%)'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 84%, 60%)'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
              stroke="hsl(215, 20%, 55%)"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="hsl(215, 20%, 55%)"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-card px-4 py-3 border border-border">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(data.date), 'MMM d, yyyy HH:mm')}
                      </div>
                      <div className="text-lg font-bold font-mono">
                        ${data.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {indicators && (
              <>
                <ReferenceLine
                  y={indicators.bollingerBands.upper}
                  stroke="hsl(270, 100%, 65%)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={indicators.bollingerBands.lower}
                  stroke="hsl(270, 100%, 65%)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={indicators.support}
                  stroke="hsl(142, 76%, 45%)"
                  strokeDasharray="5 5"
                  strokeOpacity={0.6}
                />
                <ReferenceLine
                  y={indicators.resistance}
                  stroke="hsl(0, 84%, 60%)"
                  strokeDasharray="5 5"
                  strokeOpacity={0.6}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 84%, 60%)'}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {indicators && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-accent" style={{ opacity: 0.5 }} />
            <span className="text-muted-foreground">Bollinger Bands</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-success" style={{ opacity: 0.6 }} />
            <span className="text-muted-foreground">Support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-destructive" style={{ opacity: 0.6 }} />
            <span className="text-muted-foreground">Resistance</span>
          </div>
        </div>
      )}
    </div>
  );
}
