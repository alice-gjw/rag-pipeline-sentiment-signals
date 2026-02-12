import { useState, useEffect, useCallback } from "react";
import {
  fetchTopCoins,
  fetchGlobalData,
  fetchFearGreed,
  fetchCoinHistory,
} from "../api/coingecko";

export function useCryptoData() {
  const [coins, setCoins] = useState([]);
  const [global, setGlobal] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [coinHistory, setCoinHistory] = useState(null);
  const [historyDays, setHistoryDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [coinsData, globalData, fgData] = await Promise.all([
        fetchTopCoins(),
        fetchGlobalData(),
        fetchFearGreed(),
      ]);
      setCoins(coinsData);
      setGlobal(globalData.data);
      setFearGreed(fgData.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchCoinHistory(selectedCoin, historyDays);
      setCoinHistory(data);
    } catch {
      // silently fail — chart just won't update
    }
  }, [selectedCoin, historyDays]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    coins,
    global,
    fearGreed,
    selectedCoin,
    setSelectedCoin,
    coinHistory,
    historyDays,
    setHistoryDays,
    loading,
    error,
    lastUpdated,
    refresh: loadData,
  };
}
