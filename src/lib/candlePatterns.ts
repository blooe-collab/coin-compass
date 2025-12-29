// Candle pattern recognition

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

export interface PatternResult {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
}

// Convert price data to candles (approximate from hourly data)
export function pricesToCandles(prices: [number, number][], candleCount: number = 30): Candle[] {
  if (prices.length < 2) return [];
  
  const candleSize = Math.floor(prices.length / candleCount);
  const candles: Candle[] = [];
  
  for (let i = 0; i < candleCount && i * candleSize < prices.length; i++) {
    const start = i * candleSize;
    const end = Math.min(start + candleSize, prices.length);
    const slice = prices.slice(start, end);
    
    if (slice.length === 0) continue;
    
    const priceValues = slice.map(p => p[1]);
    candles.push({
      timestamp: slice[0][0],
      open: priceValues[0],
      close: priceValues[priceValues.length - 1],
      high: Math.max(...priceValues),
      low: Math.min(...priceValues),
    });
  }
  
  return candles;
}

// Calculate body and wick sizes
function getCandleMetrics(candle: Candle) {
  const bodySize = Math.abs(candle.close - candle.open);
  const range = candle.high - candle.low;
  const isBullish = candle.close > candle.open;
  const upperWick = isBullish ? candle.high - candle.close : candle.high - candle.open;
  const lowerWick = isBullish ? candle.open - candle.low : candle.close - candle.low;
  
  return { bodySize, range, isBullish, upperWick, lowerWick };
}

// Doji: very small body compared to wicks
function isDoji(candle: Candle): boolean {
  const { bodySize, range } = getCandleMetrics(candle);
  return range > 0 && bodySize / range < 0.1;
}

// Hammer: small body at top, long lower wick
function isHammer(candle: Candle): boolean {
  const { bodySize, range, lowerWick, upperWick } = getCandleMetrics(candle);
  if (range === 0) return false;
  return (
    bodySize / range < 0.3 &&
    lowerWick > bodySize * 2 &&
    upperWick < bodySize
  );
}

// Inverted Hammer: small body at bottom, long upper wick
function isInvertedHammer(candle: Candle): boolean {
  const { bodySize, range, lowerWick, upperWick } = getCandleMetrics(candle);
  if (range === 0) return false;
  return (
    bodySize / range < 0.3 &&
    upperWick > bodySize * 2 &&
    lowerWick < bodySize
  );
}

// Bullish Engulfing: current candle body engulfs previous
function isBullishEngulfing(prev: Candle, curr: Candle): boolean {
  const prevMetrics = getCandleMetrics(prev);
  const currMetrics = getCandleMetrics(curr);
  
  return (
    !prevMetrics.isBullish &&
    currMetrics.isBullish &&
    curr.open < prev.close &&
    curr.close > prev.open &&
    currMetrics.bodySize > prevMetrics.bodySize
  );
}

// Bearish Engulfing
function isBearishEngulfing(prev: Candle, curr: Candle): boolean {
  const prevMetrics = getCandleMetrics(prev);
  const currMetrics = getCandleMetrics(curr);
  
  return (
    prevMetrics.isBullish &&
    !currMetrics.isBullish &&
    curr.open > prev.close &&
    curr.close < prev.open &&
    currMetrics.bodySize > prevMetrics.bodySize
  );
}

// Morning Star: 3 candle bullish reversal
function isMorningStar(c1: Candle, c2: Candle, c3: Candle): boolean {
  const m1 = getCandleMetrics(c1);
  const m2 = getCandleMetrics(c2);
  const m3 = getCandleMetrics(c3);
  
  return (
    !m1.isBullish && m1.bodySize > m2.bodySize &&
    m2.bodySize / m2.range < 0.3 &&
    m3.isBullish && m3.bodySize > m2.bodySize &&
    c3.close > (c1.open + c1.close) / 2
  );
}

// Evening Star: 3 candle bearish reversal
function isEveningStar(c1: Candle, c2: Candle, c3: Candle): boolean {
  const m1 = getCandleMetrics(c1);
  const m2 = getCandleMetrics(c2);
  const m3 = getCandleMetrics(c3);
  
  return (
    m1.isBullish && m1.bodySize > m2.bodySize &&
    m2.bodySize / m2.range < 0.3 &&
    !m3.isBullish && m3.bodySize > m2.bodySize &&
    c3.close < (c1.open + c1.close) / 2
  );
}

// Three White Soldiers: 3 consecutive bullish candles
function isThreeWhiteSoldiers(c1: Candle, c2: Candle, c3: Candle): boolean {
  const m1 = getCandleMetrics(c1);
  const m2 = getCandleMetrics(c2);
  const m3 = getCandleMetrics(c3);
  
  return (
    m1.isBullish && m2.isBullish && m3.isBullish &&
    c2.open > c1.open && c3.open > c2.open &&
    c2.close > c1.close && c3.close > c2.close
  );
}

// Three Black Crows: 3 consecutive bearish candles
function isThreeBlackCrows(c1: Candle, c2: Candle, c3: Candle): boolean {
  const m1 = getCandleMetrics(c1);
  const m2 = getCandleMetrics(c2);
  const m3 = getCandleMetrics(c3);
  
  return (
    !m1.isBullish && !m2.isBullish && !m3.isBullish &&
    c2.open < c1.open && c3.open < c2.open &&
    c2.close < c1.close && c3.close < c2.close
  );
}

export function detectPatterns(candles: Candle[]): PatternResult[] {
  const patterns: PatternResult[] = [];
  
  if (candles.length < 3) return patterns;
  
  const recent = candles.slice(-5);
  const last = recent[recent.length - 1];
  const secondLast = recent[recent.length - 2];
  
  // Single candle patterns on last candle
  if (isDoji(last)) {
    patterns.push({
      name: 'Doji',
      type: 'neutral',
      strength: 'moderate',
      description: 'Indecision in the market - potential reversal signal',
    });
  }
  
  if (isHammer(last)) {
    patterns.push({
      name: 'Hammer',
      type: 'bullish',
      strength: 'moderate',
      description: 'Potential bullish reversal - buyers pushing price up from lows',
    });
  }
  
  if (isInvertedHammer(last)) {
    patterns.push({
      name: 'Inverted Hammer',
      type: 'bullish',
      strength: 'weak',
      description: 'Possible bullish reversal - needs confirmation',
    });
  }
  
  // Two candle patterns
  if (recent.length >= 2) {
    if (isBullishEngulfing(secondLast, last)) {
      patterns.push({
        name: 'Bullish Engulfing',
        type: 'bullish',
        strength: 'strong',
        description: 'Strong bullish reversal - buyers overwhelmed sellers',
      });
    }
    
    if (isBearishEngulfing(secondLast, last)) {
      patterns.push({
        name: 'Bearish Engulfing',
        type: 'bearish',
        strength: 'strong',
        description: 'Strong bearish reversal - sellers overwhelmed buyers',
      });
    }
  }
  
  // Three candle patterns
  if (recent.length >= 3) {
    const c1 = recent[recent.length - 3];
    const c2 = recent[recent.length - 2];
    const c3 = recent[recent.length - 1];
    
    if (isMorningStar(c1, c2, c3)) {
      patterns.push({
        name: 'Morning Star',
        type: 'bullish',
        strength: 'strong',
        description: 'Strong bullish reversal pattern after downtrend',
      });
    }
    
    if (isEveningStar(c1, c2, c3)) {
      patterns.push({
        name: 'Evening Star',
        type: 'bearish',
        strength: 'strong',
        description: 'Strong bearish reversal pattern after uptrend',
      });
    }
    
    if (isThreeWhiteSoldiers(c1, c2, c3)) {
      patterns.push({
        name: 'Three White Soldiers',
        type: 'bullish',
        strength: 'strong',
        description: 'Strong bullish continuation - sustained buying pressure',
      });
    }
    
    if (isThreeBlackCrows(c1, c2, c3)) {
      patterns.push({
        name: 'Three Black Crows',
        type: 'bearish',
        strength: 'strong',
        description: 'Strong bearish continuation - sustained selling pressure',
      });
    }
  }
  
  return patterns;
}
