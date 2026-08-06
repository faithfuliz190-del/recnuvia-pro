// Mock, fixed exchange rates against USD, for prototype purposes only.
// A real integration would call a live FX rate provider.
const RATES_TO_USD = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  NGN: 0.000645, // ~1550 NGN per USD
  KES: 0.0077,
  INR: 0.012,
  JPY: 0.0067,
};

export function convert(amount, from, to) {
  if (from === to) return amount;
  const usd = amount * (RATES_TO_USD[from] ?? 1);
  const converted = usd / (RATES_TO_USD[to] ?? 1);
  return Math.round(converted * 100) / 100;
}
