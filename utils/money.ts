export const toNum = (v: string | number | null | undefined) =>
  v == null
    ? 0
    : typeof v === "number"
      ? v
      : Number(v.replace?.(/,/g, "") ?? v) || 0;

export const formatNGN = (v: string | number) => {
  const n = Math.round(toNum(v));
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₦${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
};
