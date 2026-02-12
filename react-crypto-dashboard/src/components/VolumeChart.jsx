import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#eab308",
  "#ef4444",
  "#14b8a6",
  "#a855f7",
];

export default function VolumeChart({ coins }) {
  const data = coins.map((c) => ({
    name: c.symbol.toUpperCase(),
    volume: c.total_volume,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="font-semibold text-lg mb-4">24h Trading Volume</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#2e3040" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1e9 ? `$${(v / 1e9).toFixed(0)}B` : `$${(v / 1e6).toFixed(0)}M`
              }
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#22232d",
                border: "1px solid #2e3040",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(val) => [
                `$${val.toLocaleString()}`,
                "Volume",
              ]}
            />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
