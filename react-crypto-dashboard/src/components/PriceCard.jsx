import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function PriceCard({ coin, active, onClick }) {
  const change = coin.price_change_percentage_24h ?? 0;
  const positive = change >= 0;
  const color = positive ? "#22c55e" : "#ef4444";

  const sparkData = (coin.sparkline_in_7d?.price ?? []).map((p, i) => ({
    i,
    p,
  }));

  return (
    <button
      onClick={onClick}
      className={`bg-card border rounded-xl p-4 text-left transition hover:border-blue-500 w-full ${
        active ? "border-blue-500" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
        <span className="font-medium">{coin.symbol.toUpperCase()}</span>
        <span className="text-gray-500 text-sm">#{coin.market_cap_rank}</span>
      </div>
      <p className="text-xl font-semibold">
        ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-sm font-medium ${positive ? "text-green-400" : "text-red-400"}`}>
          {positive ? "+" : ""}
          {change.toFixed(2)}%
        </span>
        {sparkData.length > 0 && (
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id={`grad-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#grad-${coin.id})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </button>
  );
}
