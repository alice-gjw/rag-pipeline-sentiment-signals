const COLORS = {
  "Extreme Fear": "#ef4444",
  Fear: "#f97316",
  Neutral: "#eab308",
  Greed: "#22c55e",
  "Extreme Greed": "#15803d",
};

function getLabel(value) {
  if (value <= 20) return "Extreme Fear";
  if (value <= 40) return "Fear";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Greed";
  return "Extreme Greed";
}

export default function FearGreedGauge({ data }) {
  if (!data || data.length === 0) return null;

  const current = data[0];
  const value = parseInt(current.value, 10);
  const label = getLabel(value);
  const color = COLORS[label];
  const rotation = (value / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <h2 className="font-semibold text-lg mb-4">Fear & Greed Index</h2>

      {/* Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-48 h-24 mb-2">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 95 A 90 90 0 0 1 190 95"
              fill="none"
              stroke="#2e3040"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Colored segments */}
            <path d="M 10 95 A 90 90 0 0 1 46 30" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
            <path d="M 46 30 A 90 90 0 0 1 100 5" fill="none" stroke="#f97316" strokeWidth="12" />
            <path d="M 100 5 A 90 90 0 0 1 154 30" fill="none" stroke="#eab308" strokeWidth="12" />
            <path d="M 154 30 A 90 90 0 0 1 190 95" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
            {/* Needle */}
            <line
              x1="100"
              y1="95"
              x2="100"
              y2="25"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${rotation}, 100, 95)`}
            />
            <circle cx="100" cy="95" r="5" fill="white" />
          </svg>
        </div>
        <p className="text-4xl font-bold" style={{ color }}>
          {value}
        </p>
        <p className="text-sm font-medium mt-1" style={{ color }}>
          {label}
        </p>
      </div>

      {/* History */}
      <div className="mt-4 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Recent</p>
        <div className="flex gap-1">
          {data.slice(0, 14).map((entry, i) => {
            const v = parseInt(entry.value, 10);
            const l = getLabel(v);
            const c = COLORS[l];
            return (
              <div
                key={i}
                title={`${v} — ${new Date(entry.timestamp * 1000).toLocaleDateString()}`}
                className="flex-1 h-3 rounded-sm"
                style={{ backgroundColor: c, opacity: 1 - i * 0.05 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Today</span>
          <span>14d ago</span>
        </div>
      </div>
    </div>
  );
}
