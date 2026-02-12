function formatBillions(n) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  return `$${(n / 1e6).toFixed(0)}M`;
}

export default function GlobalStats({ data }) {
  const stats = [
    {
      label: "Market Cap",
      value: formatBillions(data.total_market_cap?.usd ?? 0),
    },
    {
      label: "24h Volume",
      value: formatBillions(data.total_volume?.usd ?? 0),
    },
    {
      label: "BTC Dominance",
      value: `${(data.market_cap_percentage?.btc ?? 0).toFixed(1)}%`,
    },
    {
      label: "Active Coins",
      value: (data.active_cryptocurrencies ?? 0).toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-lg px-4 py-3"
        >
          <p className="text-gray-500 text-xs uppercase tracking-wide">
            {s.label}
          </p>
          <p className="text-lg font-semibold mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
