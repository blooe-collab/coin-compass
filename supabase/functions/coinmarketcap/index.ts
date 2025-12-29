import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('COINMARKETCAP_API_KEY');
    if (!apiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }

    const { action, params } = await req.json();
    console.log('CoinMarketCap API request:', { action, params });

    let endpoint = '';
    let queryParams = new URLSearchParams();

    switch (action) {
      case 'search':
        // Use listing endpoint filtered by slug/symbol
        endpoint = '/cryptocurrency/map';
        if (params.query) {
          queryParams.append('symbol', params.query.toUpperCase());
        }
        queryParams.append('limit', '10');
        break;

      case 'coin':
        endpoint = '/cryptocurrency/quotes/latest';
        if (params.id) {
          queryParams.append('id', params.id);
        } else if (params.symbol) {
          queryParams.append('symbol', params.symbol.toUpperCase());
        } else if (params.slug) {
          queryParams.append('slug', params.slug);
        }
        break;

      case 'history':
        // Historical OHLCV data
        endpoint = '/cryptocurrency/ohlcv/historical';
        if (params.id) {
          queryParams.append('id', params.id);
        } else if (params.symbol) {
          queryParams.append('symbol', params.symbol.toUpperCase());
        }
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (params.days || 30));
        queryParams.append('time_start', startDate.toISOString().split('T')[0]);
        queryParams.append('time_end', endDate.toISOString().split('T')[0]);
        queryParams.append('time_period', 'daily');
        break;

      case 'trending':
        // Get top gainers as trending
        endpoint = '/cryptocurrency/trending/gainers-losers';
        queryParams.append('limit', '10');
        queryParams.append('time_period', '24h');
        break;

      case 'listings':
        // Get top cryptocurrencies
        endpoint = '/cryptocurrency/listings/latest';
        queryParams.append('limit', params.limit || '100');
        queryParams.append('sort', params.sort || 'market_cap');
        break;

      case 'metadata':
        // Get coin metadata (logo, description, etc.)
        endpoint = '/cryptocurrency/info';
        if (params.id) {
          queryParams.append('id', params.id);
        } else if (params.symbol) {
          queryParams.append('symbol', params.symbol.toUpperCase());
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const url = `${CMC_BASE_URL}${endpoint}?${queryParams.toString()}`;
    console.log('Fetching:', url);

    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.status?.error_code && data.status.error_code !== 0) {
      console.error('CoinMarketCap API error:', data.status);
      throw new Error(data.status.error_message || 'API request failed');
    }

    console.log('CoinMarketCap response status:', data.status);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in coinmarketcap function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
