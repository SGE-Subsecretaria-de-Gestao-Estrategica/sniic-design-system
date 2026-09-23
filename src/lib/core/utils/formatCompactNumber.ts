export default function formatCompactNumber(value: number, decimals = 0) {
    if (!Number.isFinite(value)) return "";

    const abs = Math.abs(value);
    const units = [
      { value: 1e9, suffix: "B" },
      { value: 1e6, suffix: "M" },
      { value: 1e3, suffix: " mil" },
    ];

    const format = (n: number) => Number(n.toFixed(decimals)).toString().replace(".", ",");

    for (const unit of units) {
      if (abs >= unit.value) {
        return `${format(value / unit.value)}${unit.suffix}`;
      }
    }
  return format(value);
  }