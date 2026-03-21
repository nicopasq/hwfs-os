export const uid = () => Math.random().toString(36).slice(2, 10);
export const td  = () => new Date().toISOString().split("T")[0];

export const fmtF = (n) => {
  if (n == null || isNaN(n)) return "$0.00";
  const s = "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? "(" + s + ")" : s;
};

export const fmt = (n) => {
  if (n == null || isNaN(n)) return "$0";
  const a = Math.abs(n);
  const r = a >= 1e6 ? ("$" + (a / 1e6).toFixed(1) + "M")
    : a >= 1e3 ? ("$" + (a / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K")
    : ("$" + a.toLocaleString("en-US", { maximumFractionDigits: 0 }));
  return n < 0 ? ("(" + r + ")") : r;
};

export const pct = (n) => isNaN(n) || !isFinite(n) ? "—" : ((n * 100).toFixed(1) + "%");
