import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

function MiniChart({ data, positive }) {
  const color = positive ? "#22c55e" : "#ef4444";
  const chartData = data.map((p, i) => ({ i, p }));

  return (
    <div className="w-24 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <Area
            type="monotone"
            dataKey="p"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChangeCell({ value }) {
  if (value == null) return <span className="text-gray-500">-</span>;
  const positive = value >= 0;
  return (
    <span className={positive ? "text-green-400" : "text-red-400"}>
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export default function MarketTable({ coins, selectedCoin, onSelectCoin }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Market Overview</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Coin</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">1h</th>
              <th className="text-right px-4 py-3">24h</th>
              <th className="text-right px-4 py-3">7d</th>
              <th className="text-right px-4 py-3">Market Cap</th>
              <th className="text-right px-4 py-3">Volume (24h)</th>
              <th className="text-right px-4 py-3">7d Chart</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => {
              const sparkline = coin.sparkline_in_7d?.price ?? [];
              const change7d =
                coin.price_change_percentage_7d_in_currency ?? 0;

              return (
                <tr
                  key={coin.id}
                  onClick={() => onSelectCoin(coin.id)}
                  className={`border-t border-border cursor-pointer transition hover:bg-surface ${
                    coin.id === selectedCoin ? "bg-surface" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-500">
                    {coin.market_cap_rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="font-medium">{coin.name}</span>
                      <span className="text-gray-500 text-xs">
                        {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    $
                    {coin.current_price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChangeCell
                      value={
                        coin.price_change_percentage_1h_in_currency
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChangeCell
                      value={coin.price_change_percentage_24h}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChangeCell value={change7d} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    $
                    {coin.market_cap >= 1e9
                      ? `${(coin.market_cap / 1e9).toFixed(1)}B`
                      : `${(coin.market_cap / 1e6).toFixed(0)}M`}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    $
                    {coin.total_volume >= 1e9
                      ? `${(coin.total_volume / 1e9).toFixed(1)}B`
                      : `${(coin.total_volume / 1e6).toFixed(0)}M`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {sparkline.length > 0 && (
                        <MiniChart
                          data={sparkline}
                          positive={change7d >= 0}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
