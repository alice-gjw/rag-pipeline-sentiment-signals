import { useCryptoData } from "./hooks/useCryptoData";
import Header from "./components/Header";
import GlobalStats from "./components/GlobalStats";
import PriceCard from "./components/PriceCard";
import PriceChart from "./components/PriceChart";
import FearGreedGauge from "./components/FearGreedGauge";
import MarketTable from "./components/MarketTable";
import VolumeChart from "./components/VolumeChart";

export default function App() {
  const {
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
    refresh,
  } = useCryptoData();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center bg-card p-8 rounded-xl border border-border">
          <p className="text-red-400 text-lg mb-2">Failed to load data</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const topFour = coins.slice(0, 4);

  return (
    <div className="min-h-screen bg-surface">
      <Header lastUpdated={lastUpdated} onRefresh={refresh} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {global && <GlobalStats data={global} />}

        {/* Top coins cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topFour.map((coin) => (
            <PriceCard
              key={coin.id}
              coin={coin}
              active={coin.id === selectedCoin}
              onClick={() => setSelectedCoin(coin.id)}
            />
          ))}
        </div>

        {/* Chart + Fear & Greed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PriceChart
              coinHistory={coinHistory}
              selectedCoin={selectedCoin}
              coins={coins}
              days={historyDays}
              onDaysChange={setHistoryDays}
            />
          </div>
          <div>
            <FearGreedGauge data={fearGreed} />
          </div>
        </div>

        {/* Volume chart */}
        <VolumeChart coins={coins.slice(0, 10)} />

        {/* Market table */}
        <MarketTable
          coins={coins}
          selectedCoin={selectedCoin}
          onSelectCoin={setSelectedCoin}
        />
      </main>
    </div>
  );
}
