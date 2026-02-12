const BASE = "https://api.coingecko.com/api/v3";

export async function fetchTopCoins() {
  const res = await fetch(
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d`
  );
  if (!res.ok) throw new Error("Failed to fetch market data");
  return res.json();
}

export async function fetchCoinHistory(coinId, days = 7) {
  const res = await fetch(
    `${BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  );
  if (!res.ok) throw new Error("Failed to fetch coin history");
  return res.json();
}

export async function fetchGlobalData() {
  const res = await fetch(`${BASE}/global`);
  if (!res.ok) throw new Error("Failed to fetch global data");
  return res.json();
}

export async function fetchFearGreed() {
  const res = await fetch("https://api.alternative.me/fng/?limit=30");
  if (!res.ok) throw new Error("Failed to fetch Fear & Greed");
  return res.json();
}
