import { useState, useEffect } from 'react';
import { JsonRpcProvider, Contract } from 'ethers';
import { QIE_CHAIN_CONFIG, CONTRACT_ADDRESSES, TRUST_SCORE_ABI } from '../config/blockchain';

export const useUserStats = (walletAddress?: string) => {
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!walletAddress) {
        setTrustScore(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Use a simple JsonRpcProvider for public read access (no wallet connection needed)
        const provider = new JsonRpcProvider(QIE_CHAIN_CONFIG.rpcUrls[0]);
        const trustContract = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, provider);

        const score = await trustContract.getScore(walletAddress);
        // Ensure score is capped at 100 and non-negative (though uint shouldn't be negative)
        setTrustScore(Math.min(100, Number(score)));
      } catch (error) {
        console.error("Failed to fetch Trust Score from chain:", error);
        setTrustScore(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [walletAddress]);

  return { trustScore, loading };
};
