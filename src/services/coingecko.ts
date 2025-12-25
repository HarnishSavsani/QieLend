
import { SUPPORTED_ASSETS } from "../config/constants";

export interface AssetPriceMap {
    [symbol: string]: number;
}

const CACHE_DURATION = 60 * 1000; // 1 minute cache
let priceCache: AssetPriceMap | null = null;
let lastFetchTime = 0;

export const fetchCryptoPrices = async (): Promise<AssetPriceMap> => {
    // Return cached if fresh
    if (priceCache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
        return priceCache;
    }

    try {
        const ids = SUPPORTED_ASSETS.map(a => a.coingeckoId).filter(id => id).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        
        if (!response.ok) throw new Error("CoinGecko API Limit");

        const data = await response.json();
        
        const prices: AssetPriceMap = {};
        
        SUPPORTED_ASSETS.forEach(asset => {
            if (asset.coingeckoId && data[asset.coingeckoId]) {
                prices[asset.symbol] = data[asset.coingeckoId].usd;
            } else {
                prices[asset.symbol] = asset.defaultPrice; // Fallback
            }
        });

        // Update Cache
        priceCache = prices;
        lastFetchTime = Date.now();
        
        console.log("Updated Crypto Prices:", prices);
        return prices;

    } catch (error) {
        console.warn("Failed to fetch prices, using defaults:", error);
        // Fallback to defaults
        const defaults: AssetPriceMap = {};
        SUPPORTED_ASSETS.forEach(a => defaults[a.symbol] = a.defaultPrice);
        return defaults;
    }
};
