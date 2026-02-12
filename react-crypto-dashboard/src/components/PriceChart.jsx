import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const DAY_OPTIONS = [1, 7, 30, 90];

function formatDate(ts, days) {
  const d = new Date(ts);
  if (days <= 1) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PriceChart({ coinHistory, selectedCoin, coins, days, onDaysChange }) {
  const coin = coins.find((c) => c.id === selectedCoin);
  const coinName = coin?.name ?? selectedCoin;

  const chartData = (coinHistory?.prices ?? []).map(([ts, price]) => ({
    ts,
    price,
    label: formatDate(ts, days),
  }));

  // Downsample for performance
  const step = Math.max(1, Math.floor(chartData.length / 200));
  const sampled = chartData.filter((_, i) => i % step === 0);

  const prices = sampled.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.05 || 1;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{coinName} Price</h2>
        <div className="flex gap-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={`px-3 py-1 text-xs rounded-md transition ${
                days === d
                  ? "bg-blue-600 text-white"
                  : "bg-border text-gray-400 hover:text-white"
              }`}
            >
              {d === 1 ? "24H" : `${d}D`}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        {sampled.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampled}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2e3040" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={[min - pad, max + pad]}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`
                }
                width={65}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#22232d",
                  border: "1px solid #2e3040",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(val) => [
                  `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                  "Price",
                ]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#chartGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading chart...
          </div>
        )}
      </div>
    </div>
  );
}
