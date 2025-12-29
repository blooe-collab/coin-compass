// Technical Analysis Calculations

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  support: number;
  resistance: number;
}

export interface Signal {
  type: 'BUY' | 'SELL' | 'HOLD';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  reasons: string[];
  score: number; // -100 to 100
}

// Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

// Calculate Exponential Moving Average
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  let gains = 0;
  let losses = 0;
  
  recentChanges.forEach(change => {
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  });
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate MACD
function calculateMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  // For signal line, we need MACD values over time
  const macdValues: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdValues.push(e12 - e26);
  }
  
  const signalLine = macdValues.length >= 9 ? calculateEMA(macdValues, 9) : macdLine;
  const histogram = macdLine - signalLine;
  
  return { macdLine, signalLine, histogram };
}

// Calculate Bollinger Bands
function calculateBollingerBands(prices: number[], period: number = 20): { upper: number; middle: number; lower: number } {
  const middle = calculateSMA(prices, period);
  
  const slice = prices.slice(-period);
  const squaredDiffs = slice.map(price => Math.pow(price - middle, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: middle + (stdDev * 2),
    middle,
    lower: middle - (stdDev * 2),
  };
}

// Find Support and Resistance levels
function findSupportResistance(prices: number[]): { support: number; resistance: number } {
  const recentPrices = prices.slice(-30);
  const sorted = [...recentPrices].sort((a, b) => a - b);
  
  // Support: lower quartile area
  const supportIdx = Math.floor(sorted.length * 0.1);
  const support = sorted[supportIdx] || sorted[0];
  
  // Resistance: upper quartile area
  const resistanceIdx = Math.floor(sorted.length * 0.9);
  const resistance = sorted[resistanceIdx] || sorted[sorted.length - 1];
  
  return { support, resistance };
}

export function calculateIndicators(priceData: [number, number][]): TechnicalIndicators {
  const prices = priceData.map(p => p[1]);
  
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const bollingerBands = calculateBollingerBands(prices);
  const { support, resistance } = findSupportResistance(prices);
  
  return {
    rsi,
    macd,
    sma20,
    sma50,
    ema12,
    ema26,
    bollingerBands,
    support,
    resistance,
  };
}

export function generateSignal(indicators: TechnicalIndicators, currentPrice: number): Signal {
  const reasons: string[] = [];
  let score = 0;
  
  // RSI Analysis
  if (indicators.rsi < 30) {
    score += 25;
    reasons.push('RSI indicates oversold conditions (< 30)');
  } else if (indicators.rsi > 70) {
    score -= 25;
    reasons.push('RSI indicates overbought conditions (> 70)');
  } else if (indicators.rsi < 40) {
    score += 10;
    reasons.push('RSI approaching oversold territory');
  } else if (indicators.rsi > 60) {
    score -= 10;
    reasons.push('RSI approaching overbought territory');
  }
  
  // MACD Analysis
  if (indicators.macd.histogram > 0 && indicators.macd.macdLine > indicators.macd.signalLine) {
    score += 20;
    reasons.push('MACD bullish crossover detected');
  } else if (indicators.macd.histogram < 0 && indicators.macd.macdLine < indicators.macd.signalLine) {
    score -= 20;
    reasons.push('MACD bearish crossover detected');
  }
  
  // Moving Average Analysis
  if (currentPrice > indicators.sma20 && indicators.sma20 > indicators.sma50) {
    score += 15;
    reasons.push('Price above both SMA20 and SMA50 (bullish trend)');
  } else if (currentPrice < indicators.sma20 && indicators.sma20 < indicators.sma50) {
    score -= 15;
    reasons.push('Price below both SMA20 and SMA50 (bearish trend)');
  }
  
  // EMA Crossover
  if (indicators.ema12 > indicators.ema26) {
    score += 10;
    reasons.push('EMA12 above EMA26 (short-term bullish)');
  } else {
    score -= 10;
    reasons.push('EMA12 below EMA26 (short-term bearish)');
  }
  
  // Bollinger Bands Analysis
  if (currentPrice <= indicators.bollingerBands.lower) {
    score += 20;
    reasons.push('Price at lower Bollinger Band (potential bounce)');
  } else if (currentPrice >= indicators.bollingerBands.upper) {
    score -= 20;
    reasons.push('Price at upper Bollinger Band (potential pullback)');
  }
  
  // Support/Resistance
  const distToSupport = ((currentPrice - indicators.support) / currentPrice) * 100;
  const distToResistance = ((indicators.resistance - currentPrice) / currentPrice) * 100;
  
  if (distToSupport < 5) {
    score += 10;
    reasons.push('Price near support level');
  }
  if (distToResistance < 5) {
    score -= 10;
    reasons.push('Price near resistance level');
  }
  
  // Determine signal
  let type: 'BUY' | 'SELL' | 'HOLD';
  let strength: 'STRONG' | 'MODERATE' | 'WEAK';
  
  if (score >= 40) {
    type = 'BUY';
    strength = 'STRONG';
  } else if (score >= 20) {
    type = 'BUY';
    strength = 'MODERATE';
  } else if (score > 0) {
    type = 'BUY';
    strength = 'WEAK';
  } else if (score <= -40) {
    type = 'SELL';
    strength = 'STRONG';
  } else if (score <= -20) {
    type = 'SELL';
    strength = 'MODERATE';
  } else if (score < 0) {
    type = 'SELL';
    strength = 'WEAK';
  } else {
    type = 'HOLD';
    strength = 'MODERATE';
    reasons.push('Mixed signals - consolidation likely');
  }
  
  return { type, strength, reasons, score };
}
